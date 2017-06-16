/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */
import 'webvr-polyfill';

import h from 'hyperscript';
import emitter from 'mitt';

import * as THREE from './lib/three';
import stats from './lib/stats';
import { tempVector } from './utils/three';
import settings from './settings';
import InstancedItem from './instanced-item';
import feature from './utils/feature';
import windowSize from './utils/windowSize';
import audio from './audio';
import postprocessing from './postprocessing';

// if we're on a mobile phone that doesn't support WebVR, use polyfill
if (feature.isMobile && !feature.isTablet && (navigator.getVRDisplays === undefined)) {
  window.WebVRConfig.BUFFER_SCALE = 0.75;
  window.polyfill = new window.WebVRPolyfill();
  console.log('WebVR polyfill');
}

require('./lib/VREffect')(THREE);
require('./lib/VRControls')(THREE);
require('./lib/VRController')(THREE);

const events = emitter();
const orthographicDistance = 4;

// TODO: remove me:
// const times = [0];
// document.addEventListener('keydown', (event) => {
//   if (event.shiftKey) {
//     times.push(audio.time);
//   }
//   if (event.metaKey) {
//     console.log(times);
//   }
// });

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

let lastZoom = 4;
const zoomCamera = (zoom) => {
  const newZoom = sineInOut(zoom);
  if (newZoom === lastZoom) return;
  const { aspectRatio } = windowSize;
  const distance = orthographicDistance + newZoom * 3;
  const camera = cameras.orthographic;
  camera.left = -distance * aspectRatio;
  camera.right = distance * aspectRatio;
  camera.top = distance;
  camera.bottom = -distance;
  camera.updateProjectionMatrix();
  lastZoom = newZoom;
};

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

  scene.add(hemisphereLight, light, ambientLight);
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

const sineInOut = t => -0.5 * (Math.cos(Math.PI * t) - 1);

const scene = createScene();

const viewer = {
  camera: cameras.orthographic,
  cameras,
  scene,
  renderScene: scene,
  controllers: [{}, {}],
  controls,
  createScene,
  events,
  renderer,
  switchCamera: (name) => {
    InstancedItem.switch(
      name === 'orthographic'
        ? 'orthographic'
        : 'perspective',
    );
    viewer.camera = cameras[name];
  },
  vrEffect,
};

const clock = new THREE.Clock();
clock.start();

const renderPostProcessed = postprocessing({ renderer, camera: cameras.default, scene });
const animate = () => {
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);

  THREE.VRController.update();

  if (feature.isIODaydream) {
    viewer.daydreamController.update();
  }

  controls.update();
  events.emit('tick', dt);
  zoomCamera(
    audio.progress > 21
      ? Math.min(2, audio.progress - 21) * 0.5
      : 0
  );

  if (!vrEffect.isPresenting && viewer.camera === cameras.default) {
    renderPostProcessed();
  } else {
    vrEffect.render(viewer.renderScene, viewer.camera);
  }

  if (vrEffect.isPresenting && feature.hasExternalDisplay) {
    renderer.render(viewer.renderScene, viewer.camera);
  }

  events.emit('render', dt);
  if (feature.stats) stats();
};

animate();

export default viewer;
