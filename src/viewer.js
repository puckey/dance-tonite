/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */

import emitter from 'mitt';

import * as THREE from './lib/three';
import { tempVector } from './utils/three';
import settings from './settings';
import Room from './room';

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/ViveController')(THREE);

const getWindowAspect = () => window.innerWidth / window.innerHeight;
const events = emitter();
const orthographicDistance = 4;

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
  orthographic.position.set(-0.06, 0.08, -0.08);
  orthographic.lookAt(tempVector(0, 0, 0));

  return { default: perspective, orthographic };
}());

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;
renderer.shadowMapEnabled = false;

const containerEl = document.createElement('div');
containerEl.className = 'viewer';
containerEl.appendChild(renderer.domElement);
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
  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(1, 0.75, -1).normalize();
  scene.add(light);
  scene.add(controller1, controller2);
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

const viewer = {
  camera: cameras.default,
  cameras,
  scene: createScene(),
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
  },
  toggleVR: () => {
    if (vrEffect.isPresenting) {
      vrEffect.exitPresent();
      viewer.switchCamera('orthographic');
    } else {
      vrEffect.requestPresent().then(() => {
        viewer.switchCamera('default');
      });
    }
  },
  vrEffect,
};

const clock = new THREE.Clock();
clock.start();

const animate = () => {
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);
  controller1.update();
  controller2.update();
  controls.update();
  events.emit('tick', dt);
  vrEffect.render(viewer.scene, viewer.camera);
  events.emit('render', dt);
};

animate();

export default viewer;
