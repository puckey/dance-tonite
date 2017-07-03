/**
 * @author mflux / http://minmax.design
 * Based on @mattdesl three-orbit-viewer
 */

import emitter from 'mitt';

import * as THREE from './lib/three';
import installVREffect from './lib/VREffect';
import installVRControls from './lib/VRControls';
import installVRController from './lib/VRController';
import stats from './lib/stats';
import { tempVector } from './utils/three';
import settings from './settings';
import InstancedItem from './instanced-item';
import feature from './utils/feature';
import windowSize from './utils/windowSize';
import audio from './audio';
import postprocessing from './postprocessing';
import Room from './room';
import { sleep } from './utils/async';

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

let renderer;
let vrEffect;
let controls;
let renderPostProcessing;
let resizePostProcessing;
let clock;

const sineInOut = t => -0.5 * (Math.cos(Math.PI * t) - 1);

const scene = (() => {
  const _scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 1.86, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  _scene.add(hemisphereLight, light, ambientLight);
  _scene.fog = new THREE.Fog(0x000000, 0, 120);
  return _scene;
})();

const onResize = ({ width, height, aspectRatio }) => {
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

  resizePostProcessing(width, height);

  Object
    .values(cameras)
    .forEach((camera) => {
      camera.aspect = aspectRatio;
      camera.updateProjectionMatrix();
    });
};

const viewer = Object.assign(emitter(), {
  camera: cameras.orthographic,
  cameras,
  scene,
  renderScene: scene,
  controllers: [{}, {}],
  controls,
  renderer,
  prepare: () => {
    clock = new THREE.Clock();
    clock.start();
    installVREffect(THREE);
    installVRControls(THREE);
    installVRController(THREE);
    viewer.renderer = renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.sortObjects = false;

    const containerEl = document.createElement('div');
    containerEl.className = 'viewer';
    containerEl.appendChild(renderer.domElement);
    document.body.appendChild(containerEl);

    viewer.vrEffect = vrEffect = new THREE.VREffect(renderer);
    viewer.controls = controls = new THREE.VRControls(cameras.default);
    controls.standing = true;

    window.addEventListener('vrdisplaypresentchange', () => {
      viewer.emit('vr-present-change', vrEffect.isPresenting);
    }, false);

    const { render, resize } = postprocessing({
      renderer,
      camera: cameras.default,
      scene,
    });
    renderPostProcessing = render;
    resizePostProcessing = resize;
    windowSize.on('resize', onResize, false);
    animate();
  },

  exitPresent() {
    if (!vrEffect.isPresenting) return;
    vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  },

  enterPresent() {
    if (vrEffect.isPresenting) return;
    vrEffect.requestPresent();
    viewer.switchCamera('default');
    scene.add(viewer.camera);
  },

  toggleVR: async () => {
    if (vrEffect.isPresenting) {
      viewer.exitPresent();
    } else {
      viewer.enterPresent();
    }
  },

  switchCamera: (name) => {
    InstancedItem.switch(
      name === 'orthographic'
        ? 'orthographic'
        : 'perspective',
    );
    viewer.camera = cameras[name];
  },
  vrEffect,
});



const animate = () => {
  const dt = clock.getDelta();
  vrEffect.requestAnimationFrame(animate);

  THREE.VRController.update();

  if (feature.isIODaydream) {
    viewer.daydreamController.update();
  }

  controls.update();
  audio.tick();
  Room.clear();
  viewer.emit('tick', dt);
  zoomCamera(
    audio.progress > 21
      ? Math.min(2, audio.progress - 21) * 0.5
      : 0
  );

  if (!vrEffect.isPresenting && viewer.camera === cameras.default) {
    renderPostProcessing();
  } else {
    vrEffect.render(viewer.renderScene, viewer.camera);
  }

  if (vrEffect.isPresenting && feature.hasExternalDisplay) {
    renderer.render(viewer.renderScene, viewer.camera);
  }

  viewer.emit('render', dt);
  if (feature.stats) stats();
};

export default viewer;
