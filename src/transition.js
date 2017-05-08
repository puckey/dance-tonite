import tween from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as SDFText from './sdftext';
import * as THREE from './lib/three';
import { offsetFrom } from './utils/three';
import settings from './settings';

// Scene storage
const transitionScene = new THREE.Scene();
let mainScene;

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

const tweenFog = (from, to, duration = 2) => {
  viewer.renderScene.fog.far = from;
  return tween(
    viewer.renderScene.fog,
    {
      far: to,
      ease: 'easeOutCubic',
      duration,
    }
  ).promise;
};

const fadeOut = async (duration) => {
  fadedOut = true;
  fading = tweenFog(25, 0, duration);
  await fading;
};

const fadeIn = async (maxFogDistance, duration) => {
  fadedOut = false;
  fading = tweenFog(0, maxFogDistance, duration);
  await fading;
};

let entering;
let fading;

const enter = async (param = {}) => {
  // If fadeOut wasn't called before enter:
  if (!fadedOut && !param.immediate) {
    await fadeOut();
  }
  insideTransition = true;
  mainScene = viewer.scene;
  viewer.renderScene = transitionScene;
  transitionScene.fog = new THREE.Fog(0x000000, 0, 0);

  floatingOrb.fadeIn();
  viewer.events.on('tick', tick);
  textItem.updateLabel(param.text);
  floatingOrb.mesh.position.copy(offsetFrom(viewer.camera, 2, 0, -8));
  floatingOrb.mesh.scale.set(4, 4, 4);
  const far = 25;
  if (param.immediate) {
    viewer.renderScene.fog.far = far;
  } else {
    await fadeIn(far);
  }
};

export default {
  fadeOut,

  isInside() {
    return insideTransition;
  },

  async enter(param) {
    entering = enter(param);
    await Promise.all([entering, fading]);
  },

  async exit({ immediate } = {}) {
    await Promise.all([entering, fading]);
    if (!insideTransition) return;
    if (!fadedOut && !immediate) {
      await fadeOut();
    }
    viewer.events.off('tick', tick);

    // Switch scenes:
    viewer.renderScene = mainScene;

    insideTransition = false;
    const far = 300;
    if (immediate) {
      viewer.renderScene.fog.far = far;
    } else {
      await fadeIn(far);
    }
  },
};
