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

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/ViveController')(THREE);

const getWindowAspect = () => window.innerWidth / window.innerHeight;
const events = emitter();
const orthographicDistance = 4;

const showStats = (window.location.hash.indexOf('fps') == -1) ? false : true;

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
Shadow.configureRenderer( renderer );

const containerEl = h('div.viewer', renderer.domElement);
document.body.appendChild(containerEl);

const vrEffect = new THREE.VREffect(renderer);

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
  light.position.set(-1, 0.75, 1).normalize();

  const ambientLight = new THREE.AmbientLight( 0x444444, 0.7 );
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  scene.add( hemisphereLight );
  scene.add( light, ambientLight );
  scene.add( Shadow.shadowLight, Shadow.shadowTarget, Shadow.helper );
  scene.add(controller1, controller2);
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

let stats;
const statsMeshOffsetPosition = new THREE.Vector3(0.3,0.15,1);

if (showStats) {
  stats = new Stats();
  document.body.appendChild( stats.dom );

  scene.add( stats.mesh );
  stats.mesh.scale.set( 2.5, 2.5, 2.5 );
  stats.mesh.rotation.set( 0.0, -Math.PI, 0 );
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
  switchCamera: (name) => {
    Room.switchModel(
      name === 'orthographic'
        ? 'orthographic'
        : 'default',
    );
    viewer.camera = cameras[name];
    Shadow.setShadowProfile( name );
  },
  vrEffect
};

const clock = new THREE.Clock();
clock.start();

const animate = () => {
  if (showStats) stats.begin();
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);
  controller1.update();
  controller2.update();
  controls.update();
  events.emit('tick', dt);
  Shadow.updateFollow( viewer.camera );
  if (showStats) stats.mesh.position.copy(viewer.camera.position).add(statsMeshOffsetPosition);
  vrEffect.render(viewer.renderScene, viewer.camera);
  events.emit('render', dt);
  if (showStats) stats.end();
};

animate();

export default viewer;
