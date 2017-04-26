import tween from './utils/tween';
import Orb from './orb';
import viewer from './viewer';
import props from './props';
import * as SDFText from './sdftext';
import * as THREE from './lib/three';
import { offsetFrom } from './utils/three';

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

let time = 0;
let floatingOrb;

const sleep = (duration = 0) => new Promise(r => setTimeout(r, duration));

const tick = dt => {
  time += dt;
  floatingOrb.mesh.position.y = Math.sin(time * 2) / 4 + 2;
};

const tweenFog = (from, to) => {
  viewer.scene.fog.far = from;
  const tweener = tween(
    viewer.scene.fog,
    {
      far: to,
      ease: 'easeOutCubic',
      duration: 2,
    }
  );
  return new Promise(resolve => {
    tweener.on('complete', resolve);
  });
};

const fadeOut = async () => {
  await tweenFog(25, 0);
};

const fadeIn = async maxFogDistance => {
  await tweenFog(0, maxFogDistance);
};

export default {
  async enter(param, callback) {
    await fadeOut();
    mainScene = viewer.scene;
    viewer.scene = transitionScene;
    viewer.scene.fog = new THREE.Fog(0x000000, 0, 0);

    floatingOrb = new Orb();
    floatingOrb.fadeIn();
    viewer.events.on('tick', tick);
    text.updateLabel(param.text);
    text.position.copy(offsetFrom(viewer.camera, -5, 2, -10));
    text.lookAt(viewer.camera.position);
    floatingOrb.mesh.position.copy(offsetFrom(viewer.camera, 2, 0, -8));
    floatingOrb.mesh.scale.set(4, 4, 4);

    // Welcome to The Transition Space
    await fadeIn(25);
    await sleep(param.duration);
    await fadeOut();

    // Flip the scenes again
    floatingOrb.destroy();
    viewer.scene = mainScene;
    if (callback) callback();
  },
  async exit(callback) {
    fadeIn(300);
    if (callback) callback();
  },
};
