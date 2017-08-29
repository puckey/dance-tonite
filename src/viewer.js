/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import emitter from 'mitt';

import * as THREE from '../third_party/threejs/three';
import installVREffect from '../third_party/threejs/VREffect';
import installVRControls from '../third_party/threejs/VRControls';
import installVRController from '../third_party/VRController/VRController';
import stats from '../third_party/stats/stats';
import { tempVector } from './utils/three';
import settings from './settings';
import InstancedItem from './instanced-item';
import feature from './utils/feature';
import windowSize from './utils/windowSize';
import audio from './audio';
import Room from './room';
import { backgroundColor } from './theme/colors';
import { queryData } from './utils/url';
import nosleep from './utils/nosleep';

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
  const perspective = new THREE.PerspectiveCamera(70, aspectRatio, 0.01, 1000);
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

const cameraWorldPos = new THREE.Vector3();

let lastZoom = 4;
let lastAspectRatio;
const zoomCamera = (zoom) => {
  const newZoom = sineInOut(zoom);
  const { aspectRatio } = windowSize;
  if (newZoom === lastZoom && lastAspectRatio === aspectRatio) return;
  const distance = orthographicDistance + (feature.isMobile ? newZoom : newZoom * 3);
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
let clock;

const sineInOut = t => -0.5 * (Math.cos(Math.PI * t) - 1);
const fog = new THREE.Fog(backgroundColor, 10, 200);

const createScene = () => {
  const _scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(-1.42, 1.86, 0.74).normalize();

  const ambientLight = new THREE.AmbientLight(0x444444, 0.7);
  const hemisphereLight = new THREE.HemisphereLight(0x606060, 0x404040);

  _scene.add(hemisphereLight, light, ambientLight);
  _scene.fog = fog;
  return _scene;
};

const scene = createScene();

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
  cameraWorldPos,
  createScene,
  scene,
  renderScene: scene,
  controllers: [{}, {}],
  controls,
  renderer,
  fog,
  stopAnimating: () => {
    viewer.animating = false;
  },
  startAnimating: () => {
    viewer.animating = true;
    viewer.animate();
  },
  isOrthographic: true,
  animate: (timestamp, staticTime) => {
    const dt = clock.getDelta();
    if (viewer.animating) {
      vrEffect.requestAnimationFrame(viewer.animate);
    }

    if (feature.has6DOF) {
      THREE.VRController.update();
    }

    if (feature.isIODaydream) {
      viewer.daydreamController.update();
    }

    if (vrEffect.isPresenting) {
      controls.update();
    }
    audio.tick(staticTime);
    Room.clear();
    viewer.emit('tick', dt);

    cameraWorldPos.setFromMatrixPosition(viewer.camera.matrixWorld);

    zoomCamera(
      audio.progress > 21
        ? Math.min(3, audio.progress - 21) * 0.33333
        : 0
    );

    if (staticTime !== undefined) return;

    vrEffect.render(viewer.renderScene, viewer.camera);

    if (vrEffect.isPresenting && feature.hasExternalDisplay) {
      renderer.render(viewer.renderScene, viewer.camera);
    }

    viewer.emit('render', dt);
    if (settings.stats) stats(renderer);
  },
  prepare: () => {
    clock = new THREE.Clock();
    clock.start();
    installVREffect(THREE);
    installVRControls(THREE);
    installVRController(THREE);
    viewer.renderer = renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(backgroundColor);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.maxPixelRatio));
    renderer.setSize(windowSize.width, windowSize.height);
    renderer.sortObjects = false;

    const containerEl = document.createElement('div');
    containerEl.className = 'viewer';
    containerEl.appendChild(renderer.domElement);
    document.body.appendChild(containerEl);

    viewer.vrEffect = vrEffect = new THREE.VREffect(renderer);
    viewer.vrEffect.setLogging(settings.logging);

    let defaultVRRes = 1.0;
    // if (feature.isMobile) {
    //   defaultVRRes = 0.85;
    // }
    const vrRes = queryData.res || defaultVRRes;
    viewer.vrEffect.setVRResolutionRatio(vrRes);

    const defaultVRFOV = feature.isMobile ? 0.9 : 1.0;
    const vrFOV = queryData.fov || defaultVRFOV;
    viewer.vrEffect.setFOVRenderRatio(vrFOV);

    viewer.controls = controls = new THREE.VRControls(cameras.default);
    controls.standing = true;

    window.addEventListener('vrdisplaypresentchange', () => {
      viewer.emit('vr-present-change', vrEffect.isPresenting);
      if (!vrEffect.isPresenting) {
        viewer.switchCamera('orthographic');
        nosleep.enable();
      }
    }, false);

    windowSize.on('resize', onResize, false);
  },

  exitPresent() {
    if (!vrEffect.isPresenting) return;
    vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  },

  enterPresent() {
    if (vrEffect.isPresenting) return;
    if (feature.isMobile) {
      if (feature.vrPolyfill) {
        // the wake lock feature of webvr polyfill is broken. use nosleep instead
        vrEffect.getVRDisplay().wakelock_ = { request: () => {}, release: () => {} };
        nosleep.enable();
      } else {
        nosleep.disable();
      }
    }
    vrEffect.requestPresent();
    setTimeout(() => {
      viewer.switchCamera('default');
    }, 10); // Delay switching 10ms to avoid flashing POV before overlay is displayed
  },

  toggleVR: () => {
    if (vrEffect.isPresenting) {
      viewer.exitPresent();
    } else {
      viewer.enterPresent();
    }
  },

  switchCamera: (name) => {
    const isOrthographic = viewer.isOrthographic = name === 'orthographic';
    InstancedItem.switch(isOrthographic ? name : 'perspective');
    viewer.camera = cameras[name];
  },
  vrEffect,
});

export default viewer;
