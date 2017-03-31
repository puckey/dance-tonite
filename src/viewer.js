/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */

import emitter from 'mitt';

import * as THREE from './lib/three';

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/ViveController')(THREE);

const getWindowAspect = () => window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(70, getWindowAspect(), 0.1, 1000);
const events = emitter();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;

const containerEl = document.createElement('div');
containerEl.className = 'viewer';
containerEl.appendChild(renderer.domElement);
document.body.appendChild(containerEl);

const vrEffect = new THREE.VREffect(renderer);

const controls = new THREE.VRControls(camera);
controls.standing = true;

const controller1 = new THREE.ViveController(0);
const controller2 = new THREE.ViveController(1);
// scene.add(controller1, controller2);

// Use controllers:
controller1.standingMatrix = controls.getStandingMatrix();
controller2.standingMatrix = controls.getStandingMatrix();

const clock = new THREE.Clock();
clock.start();

const createScene = () => {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);
  return scene;
};

window.addEventListener('resize', () => {
  camera.aspect = getWindowAspect();
  camera.updateProjectionMatrix();
  const { innerWidth, innerHeight } = window;
  vrEffect.setSize(innerWidth, innerHeight);
}, false);

const viewer = {
  controllers: [controller1, controller2],
  camera,
  controls,
  events,
  renderer,
  scene: createScene(),
  createScene,
  toggleVR: () => vrEffect[
    vrEffect.isPresenting
      ? 'exitPresent'
      : 'requestPresent'
    ](),
  vrEffect,
};

const animate = () => {
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);
  controller1.update();
  controller2.update();
  controls.update();
  events.emit('tick', dt);
  vrEffect.render(viewer.scene, camera);
  events.emit('render', dt);
};

animate();

export default viewer;
