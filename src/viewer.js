/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */
import h from 'hyperscript';
import emitter from 'mitt';

import * as THREE from './lib/three';
import stats from './lib/stats';
import { tempVector } from './utils/three';
import settings from './settings';
import Room from './room';
import feature from './utils/feature';
import windowSize from './utils/windowSize';

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/VRController')(THREE);

const events = emitter();
const orthographicDistance = 4;

const cameras = (function () {
  const { aspectRatio } = windowSize;
  const perspective = new THREE.PerspectiveCamera(90, aspectRatio, 0.01, 200);
  perspective.lookAt(tempVector(0, 0, 1));
  perspective.position.y = settings.holeHeight;


  const orthographic = new THREE.OrthographicCamera(
    -orthographicDistance * aspectRatio,
    orthographicDistance * aspectRatio,
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
renderer.setSize(windowSize.width, windowSize.height);
renderer.sortObjects = false;

const containerEl = h('div.viewer', renderer.domElement);
document.body.appendChild(containerEl);

const vrEffect = new THREE.VREffect(renderer);

const controls = new THREE.VRControls(cameras.default);
controls.standing = true;


const createScene = () => {
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 1.86, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  scene.add(hemisphereLight);
  scene.add(light, ambientLight);
  scene.fog = new THREE.Fog(0x000000, 0, 120);
  return scene;
};

windowSize.on('resize', ({ width, height, aspectRatio }) => {
  const { orthographic } = cameras;
  Object.assign(
    orthographic,
    {
      left: -orthographicDistance * aspectRatio,
      right: orthographicDistance * aspectRatio,
    },
  );

  vrEffect.setSize(width, height);

  renderer.domElement.style.width = `${width}px`;
  renderer.domElement.style.height = `${height}px`;

  Object
    .values(cameras)
    .forEach((camera) => {
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
    });
}, false);

const scene = createScene();

const viewer = {
  camera: cameras.default,
  cameras,
  scene,
  renderScene: scene,
  controllers: [{}, {}],
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
  vrEffect,
};

const clock = new THREE.Clock();
clock.start();

const animate = () => {
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
  if (feature.stats) stats();
};

animate();

export default viewer;
