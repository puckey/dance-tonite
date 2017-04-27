import tween from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as SDFText from './sdftext';
import * as THREE from './lib/three';
import { offsetFrom } from './utils/three';
import sleep from './utils/async';

// Scene storage
const transitionScene = new THREE.Scene();
let mainScene;

// Set up stage
const textCreator = SDFText.creator();
const text = textCreator.create('', {
  wrapWidth: 2000,
  scale: 15,
  align: 'center',
  color: 0xffff07,
});

transitionScene.add(text);
transitionScene.add(props.grid);

const floatingOrb = new Orb(transitionScene);

let time = 0;
let fadedOut = false;
let insideTransition = false;

const tick = (dt) => {
  time += dt;
  floatingOrb.mesh.position.y = Math.sin(time * 2) / 4 + 2;
};

const tweenFog = (from, to, duration = 2) => {
  viewer.renderScene.fog.far = from;
  return new Promise(resolve => {
    tween(
      viewer.renderScene.fog,
      {
        far: to,
        ease: 'easeOutCubic',
        duration,
      }
    ).on('complete', resolve);
  });
};

const fadeOut = async (duration) => {
  fadedOut = true;
  await tweenFog(25, 0, duration);
};

const fadeIn = async (maxFogDistance, duration) => {
  fadedOut = false;
  await tweenFog(0, maxFogDistance, duration);
};

export default {
  fadeOut,

  async enter(param) {
    // If fadeOut wasn't called before enter:
    if (!fadedOut) {
      await fadeOut();
    }
    insideTransition = true;
    mainScene = viewer.scene;
    viewer.renderScene = transitionScene;
    transitionScene.fog = new THREE.Fog(0x000000, 0, 0);

    floatingOrb.fadeIn();
    viewer.events.on('tick', tick);
    text.updateLabel(param.text);
    text.position.copy(offsetFrom(viewer.camera, -5, 2, -10));
    text.lookAt(viewer.camera.position);
    floatingOrb.mesh.position.copy(offsetFrom(viewer.camera, 2, 0, -8));
    floatingOrb.mesh.scale.set(4, 4, 4);
    // Fade in the transition space:
    await fadeIn(25);
  },

  async exit({ immediate } = {}) {
    if (!insideTransition) return;
    if (!fadedOut) {
      await fadeOut();
    }
    viewer.events.off('tick', tick);

    // Switch scenes:
    viewer.renderScene = mainScene;

    insideTransition = false;
    await fadeIn(300, immediate ? 0 : undefined);
  },
};
