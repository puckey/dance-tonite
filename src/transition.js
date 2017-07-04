import createTweener from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as THREE from './lib/three';
import { offsetFrom } from './utils/three';
import { textColor } from './theme/colors';
import dummyTextureUrl from './public/dummy.png';
import deps from './deps';

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
  const version = transitionVersion;
  if (logging) {
    console.log('fadeOut', { version, duration, time: new Date() });
  }
  setTimeout(() => {
    if (version === transitionVersion) {
      if (logging) {
        console.log('removing label', { version, duration, time: new Date() });
      }
      textItem.updateLabel('');
    }
  }, duration * 0.5);
  fadedOut = true;
  return tweenFog(25, 0, duration);
};

const fadeIn = (maxFogDistance, duration) => {
  if (logging) {
    console.log('fadeIn', { transitionVersion, maxFogDistance, duration, time: new Date() });
  }
  fadedOut = false;
  return tweenFog(0, maxFogDistance, duration);
};

const revealFar = 300;
const transitionSpaceFar = 25;

const transition = {
  prepare: () => {
    transitionScene = new THREE.Scene();

    // Set up stage
    const textCreator = deps.SDFText.creator();
    textItem = textCreator.create('', {
      wrapWidth: 4000,
      scale: 15,
      align: 'center',
      color: textColor.getHex(),
    });

    pivot = new THREE.Object3D();
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

  async enter(param = {}) {
    if (logging) {
      console.log('transition.enter', { transitionVersion, ...param, time: new Date() });
    }

    const version = transitionVersion;
    // If fadeOut wasn't called before enter:
    if (!fadedOut) {
      if (logging) {
        console.log('transition.enter: fading out to black to hide viewer scene');
      }
      await fadeOut();
    }
    insideTransition = true;
    if (version !== transitionVersion) {
      if (logging) {
        console.log('transition.enter returned early because of version difference',
        {
          time: new Date()
        });
      }
      return;
    }
    viewer.renderScene = transitionScene;
    transitionScene.fog = new THREE.Fog(0x000000, 0, 0);

    floatingOrb.fadeIn();
    viewer.on('tick', tick);
    textItem.updateLabel(param.text);
    floatingOrb.mesh.position.set(0, 0, -8);
    floatingOrb.mesh.scale.set(4, 4, 4);
    await fadeIn(transitionSpaceFar);
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
      await fadeOut();
    }
    transition.reset(true);
    if (logging && version === transitionVersion) {
      console.log(
        'transition.exit: fadingIn viewer scene',
        { version }
      );
      await fadeIn(revealFar);
    }
  },

  reset(soft) {
    if (logging) {
      console.log(
        'transition.reset',
        { soft, time: new Date() }
      );
    }
    insideTransition = false;
    fadedOut = false;
    viewer.off('tick', tick);
    viewer.renderScene = viewer.scene;
    if (tweener) {
      if (logging) {
        console.log('transition.reset: cancelling tweener');
      }
      tweener.cancel();
    }
    insideTransition = false;
    if (!soft) {
      if (logging) {
        console.log('transition.reset: hard reveal of viewer scene');
      }
      viewer.renderScene.fog.far = revealFar;
      transitionVersion += 1;
    }
  },
};

export default transition;
