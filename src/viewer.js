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
import feature from './utils/feature';
import daydreamController from './lib/daydream-controller';

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/ViveController')(THREE);
require('./lib/VRController')(THREE);

const getWindowAspect = () => window.innerWidth / window.innerHeight;
const events = emitter();
const orthographicDistance = 4;

const showStats = !(window.location.hash.indexOf('fps') === -1);

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
[ renderer ].forEach( function( renderer ){
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
});

const containerEl = h('div.viewer', renderer.domElement);
document.body.appendChild(containerEl);

const vrEffect = new THREE.VREffect(renderer);
if (feature.isIODaydream) {
  vrEffect.setVRResolutionRatio(0.9);
}

const controls = new THREE.VRControls(cameras.default);
controls.standing = true;

const controllers = [];

window.addEventListener('vr controller connected', function( {detail:controller} ){

  if( controller.gamepadStyle === 'daydream' ){
    return;
  }

  controller.standingMatrix = controls.getStandingMatrix();
  controller.head = cameras.default;

  // controllers.push( controller );
  if( controller.gamepad.hand === 'left' ){
    controllers[ 0 ] = controller;
  }
  else{
    controllers[ 1 ] = controller;
  }

  events.emit( 'controllerConnected', controller );
});

const createScene = () => {
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 1.86, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  scene.add(hemisphereLight);
  scene.add(light, ambientLight);
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

  renderer.domElement.style.width = innerWidth + "px";
  renderer.domElement.style.height = innerHeight + "px";

  Object
    .values(cameras)
    .forEach((camera) => {
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    });
}, false);

const scene = createScene();

let stats;

if (showStats) {
  stats = new Stats();
}


const viewer = {
  camera: cameras.default,
  cameras,
  daydreamController,
  scene,
  renderScene: scene,
  controllers,
  controls,
  createScene,
  events,
  renderer,
  countActiveControllers: () => {
    let count = 0;
    if (controllers[0] !==undefined && controllers[0].visible) count += 1;
    if (controllers[1] !==undefined && controllers[1].visible) count += 1;
    return count;
  },
  switchCamera: (name) => {
    Room.switchModel(
      name === 'orthographic'
        ? 'orthographic'
        : 'default',
    );
    viewer.camera = cameras[name];
  },
  vrEffect,
};

const clock = new THREE.Clock();
clock.start();

let lastFPSLogTime = 0;

const animate = () => {
  if (showStats) stats.begin();
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);

  THREE.VRController.update();

  if (feature.isIODaydream) {
    viewer.daydreamController.update();
  }
  controls.update();
  events.emit('tick', dt);

  vrEffect.render(viewer.renderScene, viewer.camera);
  if (vrEffect.isPresenting && feature.hasExternalDisplay) {
      renderer.render(viewer.renderScene, viewer.camera);
  }

  events.emit('render', dt);
  if (showStats) stats.end();

  if (showStats) {
    if( Date.now() - lastFPSLogTime > 1000 ){
      console.log( stats.fps )
      lastFPSLogTime = Date.now();
    }
  }

};

animate();

export default viewer;
