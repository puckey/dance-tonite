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
import createTweener from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as THREE from '../third_party/threejs/three';
import { textColor, backgroundColor } from './theme/colors';
import dummyTextureUrl from './public/dummy.png';
import deps from './deps';
import settings from './settings';
import { sleep } from './utils/async';
import cull from './cull';

const tween = createTweener();

const logging = false;

let transitionVersion = 0;
let transitionScene;
let textItem;
let pivot;
let time = 0;
let fadedOut = false;
let insideTransition = false;
let floatingOrb;

let Y_AXIS;
let Z_AXIS;
let TEMP_VECTOR;
let TEMP_VECTOR_2;

const tick = (dt) => {
  time += dt;
  floatingOrb.mesh.position.y = Math.sin(time * 2) / 4 + 2;
  // From: http://stackoverflow.com/questions/34447119/positioning-a-three-js-object-in-front-of-the-camera-but-not-tied-to-the-camera
  const direction = TEMP_VECTOR.copy(Z_AXIS);
  // Apply the camera's quaternion onto the unit vector of one of the axes
  // of our desired rotation plane (the z axis of the xz plane, in this case).
  direction.applyQuaternion(viewer.camera.quaternion);
  // Project the direction vector onto the y axis to get the y component
  // of the direction.
  const yComponent = TEMP_VECTOR_2.copy(Y_AXIS).multiplyScalar(direction.dot(Y_AXIS));
  // Subtract the y component from the direction vector so that we are
  // left with the x and z components.
  direction.sub(yComponent);
  // Normalize the direction into a unit vector again.
  direction.normalize();
  // Set the pivot's quaternion to the rotation required to get from the z axis
  // to the xz component of the camera's direction.
  pivot.quaternion.setFromUnitVectors(Z_AXIS, direction);
  // Finally, set the pivot's position as well, so that it follows the camera.
  pivot.position.copy(viewer.camera.position);
};

const fadeOut = async (fromWithin) => {
  if (insideTransition) {
    floatingOrb.fadeOut();
  } else {
    viewer.insideTransition = true;
  }
  fadedOut = true;
  if (!fromWithin) {
    transitionVersion += 1;
  }
  const version = transitionVersion;
  if (logging) {
    console.log('fadeOut', { version, time: new Date() });
  }
  await tween(
    viewer.renderScene.fog,
    {
      near: 0.01,
      ease: 'easeInCubic',
      duration: 1,
    }
  ).promise;
  textItem.updateLabel('');
  if (version !== transitionVersion) return;
  await tween(
    viewer.renderScene.fog,
    {
      near: 0.01,
      far: 0.01,
      ease: 'easeOutCubic',
      duration: 1,
    }
  ).promise;
};

const fadeIn = async (distance) => {
  if (logging) {
    console.log('fadeIn', { transitionVersion, distance, time: new Date() });
  }
  fadedOut = false;
  const far = distance + settings.roomDepth;
  await tween(
    viewer.renderScene.fog,
    {
      far: Math.min(distance, transitionSpaceFar),
      ease: 'easeInCubic',
      duration: 1,
    }
  ).promise;
  await tween(
    viewer.renderScene.fog,
    {
      near: distance,
      far,
      ease: 'easeOutCubic',
      duration: 1,
    }
  ).promise;
};

const transitionSpaceFar = 15;

const transition = {
  prepare: () => {
    transitionScene = new THREE.Scene();

    // Set up stage
    const textCreator = deps.SDFText.creator();
    textItem = textCreator.create('', {
      wrapWidth: 4000,
      scale: 7,
      align: 'center',
      color: textColor.getHex(),
    });

    pivot = new THREE.Object3D();
    pivot.add(textItem);
    textItem.position.z = -12;
    textItem.position.y = 0.25;

    transitionScene.add(pivot);
    transitionScene.add(props.grid);

    const debugMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0, 0, 0),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(dummyTextureUrl),
      })
    );
    debugMesh.frustumCulled = false;
    // Move an extra invisible object3d with a texture to the end of scene's children
    // array in order to solve a texture glitch as described in:
    // https://github.com/puckey/you-move-me/issues/129
    transitionScene.add(debugMesh);

    floatingOrb = new Orb(transitionScene);

    Y_AXIS = new THREE.Vector3(0, 1, 0);
    Z_AXIS = new THREE.Vector3(0, 0, 1);
    TEMP_VECTOR = new THREE.Vector3();
    TEMP_VECTOR_2 = new THREE.Vector3();
  },

  fadeOut,

  isInside() {
    return insideTransition;
  },

  isFadedOut() {
    return fadedOut;
  },

  async enter(param = {}) {
    viewer.insideTransition = true;
    const then = Date.now();
    transitionVersion += 1;
    const version = transitionVersion;

    if (logging) {
      console.log('transition.enter', { transitionVersion, ...param, time: new Date() });
    }

    // If fadeOut wasn't called before enter:
    if (!fadedOut) {
      if (logging) {
        console.log('transition.enter: fading out to black to hide viewer scene');
      }
      await fadeOut(true);
    }
    insideTransition = true;

    floatingOrb.fadeIn();
    floatingOrb.mesh.position.set(0, 0, -8);
    floatingOrb.mesh.scale.set(2, 2, 2);

    if (version !== transitionVersion) {
      if (logging) {
        console.log('transition.enter returned early because of version difference',
          {
            time: new Date(),
          }
        );
      }
      return;
    }
    viewer.renderScene = transitionScene;
    transitionScene.fog = new THREE.Fog(backgroundColor, 0, 0);
    transitionScene.fog.useZDepth = true;

    viewer.on('tick', tick);
    textItem.updateLabel(param.text);
    await fadeIn(transitionSpaceFar);
    if (param.duration) {
      await sleep(Math.max(0, param.duration - (Date.now() - then)));
    }
  },

  async exit() {
    if (logging) console.log('transition.exit');
    if (!insideTransition) {
      if (logging) {
        console.log(
          'transition.exit returned early because not inside transition',
          { insideTransition, time: new Date() }
        );
      }
      return;
    }
    transitionVersion += 1;
    const version = transitionVersion;
    if (!fadedOut) {
      if (logging) {
        console.log(
          'transition.exit: fading out to black to hide transition scene',
          { version }
        );
      }
      await fadeOut(true);
    }
    transition.reset(true);
    if (version === transitionVersion) {
      if (logging) {
        console.log(
          'transition.exit: fadingIn viewer scene',
          { version }
        );
      }
      const distance = settings.maxCullDistance;
      cull.setDistance(distance);
      await fadeIn(distance);
    }
    viewer.insideTransition = false;
  },

  reset(fromWithin) {
    if (!fromWithin) {
      transitionVersion += 1;
    }
    if (logging) {
      console.log(
        'transition.reset',
        { fromWithin, time: new Date() }
      );
    }
    insideTransition = false;
    fadedOut = false;
    viewer.off('tick', tick);
    viewer.renderScene = viewer.scene;
    insideTransition = false;
    if (!fromWithin) {
      if (logging) {
        console.log('transition.reset: hard reveal of viewer scene');
      }
      viewer.insideTransition = false;
    }
  },
};

export default transition;
