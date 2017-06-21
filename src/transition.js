import tween from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as SDFText from './sdftext';
import * as THREE from './lib/three';
import { offsetFrom } from './utils/three';
import settings from './settings';
import dummyTextureUrl from './public/dummy.png';

let transitionVersion = 0;

const transitionScene = new THREE.Scene();

// Set up stage
const textCreator = SDFText.creator();
const textItem = textCreator.create('', {
  wrapWidth: 4000,
  scale: 15,
  align: 'center',
  color: settings.textColor,
});

const pivot = new THREE.Object3D();
pivot.add(textItem);
textItem.position.z = -20;
textItem.position.y = 3;

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

const floatingOrb = new Orb(transitionScene);

let time = 0;
let fadedOut = false;
let insideTransition = false;

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);
const TEMP_VECTOR = new THREE.Vector3();
const TEMP_VECTOR_2 = new THREE.Vector3();

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

let tweener;
const tweenFog = (from, to, duration = 2) => {
  viewer.renderScene.fog.far = from;
  tweener = tween(
    viewer.renderScene.fog,
    {
      far: to,
      ease: 'easeOutCubic',
      duration,
    }
  );
  return tweener.promise;
};

const fadeOut = (duration) => {
  fadedOut = true;
  return tweenFog(25, 0, duration);
};

const fadeIn = (maxFogDistance, duration) => {
  fadedOut = false;
  return tweenFog(0, maxFogDistance, duration);
};

const revealFar = 300;
const transitionSpaceFar = 25;

const transition = {
  fadeOut,

  isInside() {
    return insideTransition;
  },

  async enter(param = {}) {
    const version = transitionVersion;
    // If fadeOut wasn't called before enter:
    if (!fadedOut) {
      await fadeOut();
    }
    insideTransition = true;
    if (version !== transitionVersion) {
      return;
    }
    viewer.renderScene = transitionScene;
    transitionScene.fog = new THREE.Fog(0x000000, 0, 0);

    floatingOrb.fadeIn();
    viewer.events.on('tick', tick);
    textItem.updateLabel(param.text);
    floatingOrb.mesh.position.copy(offsetFrom(viewer.camera, 2, 0, -8));
    floatingOrb.mesh.scale.set(4, 4, 4);
    if (param.immediate) {
      viewer.renderScene.fog.far = transitionSpaceFar;
    } else {
      await fadeIn(transitionSpaceFar);
    }
  },

  async exit() {
    if (!insideTransition) return;
    transitionVersion += 1;
    const version = transitionVersion;
    if (!fadedOut) {
      await fadeOut();
    }
    transition.reset(true);
    if (version === transitionVersion) {
      await fadeIn(revealFar);
    }
  },

  reset(soft) {
    insideTransition = false;
    fadedOut = false;
    viewer.events.off('tick', tick);
    viewer.renderScene = viewer.scene;
    if (tweener) tweener.cancel();
    insideTransition = false;
    if (!soft) {
      viewer.renderScene.fog.far = revealFar;
      transitionVersion += 1;
    }
  },
};

export default transition;
