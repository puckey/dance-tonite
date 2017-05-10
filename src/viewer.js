/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */
import h from 'hyperscript';
import emitter from 'mitt';

import * as THREE from './lib/three';
import Stats from './lib/stats';
import { tempVector } from './utils/three';
import settings from './settings';
import Room from './room';
import * as Shadow from './shadow';
import feature from './utils/feature';

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/ViveController')(THREE);

const getWindowAspect = () => window.innerWidth / window.innerHeight;
const events = emitter();
const orthographicDistance = 4;

const showStats = !(window.location.hash.indexOf('fps') === -1);
const shadowsEnabled = false;

const cameras = (function () {
  const aspect = getWindowAspect();

  const perspective = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);
  perspective.lookAt(tempVector(0, 0, 1));
  perspective.position.y = settings.holeHeight;

  const orthographic = new THREE.OrthographicCamera(
    -orthographicDistance * aspect,
    orthographicDistance * aspect,
    orthographicDistance,
    -orthographicDistance,
    -100,
    1000,
  );
  orthographic.position.set(0.06, 0.08, 0.08);
  orthographic.lookAt(tempVector());

  return { default: perspective, orthographic };
}());

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;

if (shadowsEnabled)
  Shadow.configureRenderer(renderer);

const containerEl = h('div.viewer', renderer.domElement);
document.body.appendChild(containerEl);

const vrEffect = new THREE.VREffect(renderer);
vrEffect.setVRResolutionRatio(1.0);

const controls = new THREE.VRControls(cameras.default);
controls.standing = true;

const controller1 = new THREE.ViveController(0);
const controller2 = new THREE.ViveController(1);

// Use controllers:
controller1.standingMatrix = controls.getStandingMatrix();
controller2.standingMatrix = controls.getStandingMatrix();

const createScene = () => {
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 2.26, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  scene.add(hemisphereLight);
  scene.add(light, ambientLight);

  if (shadowsEnabled) {  
    scene.add(Shadow.shadowLight, Shadow.shadowTarget);
    //  Uncomment to see shadow volume
    // scene.add( Shadow.helper );
  }
  scene.fog = new THREE.Fog(0x000000, 0, 75);
  return scene;
};

window.addEventListener('resize', () => {
  const aspect = getWindowAspect();
  const { orthographic } = cameras;
  Object.assign(
    orthographic,
    {
      left: -orthographicDistance * aspect,
      right: orthographicDistance * aspect,
    },
  );

  const { innerWidth, innerHeight } = window;
  vrEffect.setSize(innerWidth, innerHeight);
  Object
    .values(cameras)
    .forEach((camera) => {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    });
}, false);

const scene = createScene();
scene.add(controller1, controller2);

let stats;
const statsMeshOffsetPosition = new THREE.Vector3(-0.3, 0.15, -1.5);

if (showStats) {
  stats = new Stats();
  document.body.appendChild(stats.dom);

  scene.add(stats.mesh);
  stats.mesh.scale.set(2.5, 2.5, 2.5);
}


const viewer = {
  camera: cameras.default,
  cameras,
  scene,
  renderScene: scene,
  controllers: [controller1, controller2],
  controls,
  createScene,
  events,
  renderer,
  countActiveControllers: () => {
    let count = 0;
    if (controller1.visible) count += 1;
    if (controller2.visible) count += 1;
    return count;
  },
  switchCamera: (name) => {
    Room.switchModel(
      name === 'orthographic'
        ? 'orthographic'
        : 'default',
    );
    viewer.camera = cameras[name];

    if (shadowsEnabled) Shadow.setShadowProfile(name);
  },
  vrEffect,
};

const clock = new THREE.Clock();
clock.start();

let last = 0;

const animate = () => {
  if (showStats) stats.begin();
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);
  controller1.update();
  controller2.update();
  controls.update();
  events.emit('tick', dt);
  if (shadowsEnabled) Shadow.updateFollow(viewer.camera);
  if (showStats) stats.mesh.position.copy(viewer.camera.position).add(statsMeshOffsetPosition);
  vrEffect.render(viewer.renderScene, viewer.camera);
  if (vrEffect.isPresenting && feature.hasExternalDisplay) {
    renderer.render(viewer.renderScene, viewer.camera);
  }
  events.emit('render', dt);
  if (showStats) stats.end();

  if (showStats) {
    if( Date.now() - last > 1000 ){
      console.log( stats.fps )
      last = Date.now();
    }

  }
};

animate();

export default viewer;
