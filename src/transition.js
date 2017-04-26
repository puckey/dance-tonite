import { tween } from 'shifty';
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
const tick = dt => {
  time += dt;
  floatingOrb.mesh.position.y = Math.sin(time * 2) / 4 + 2;
};

const fadeOut = async () => {
  await tween({
    from: { far: 25 },
    to: { far: 0 },
    duration: 2000,
    easing: 'easeOutCubic',
    step: ({ far }) => {
      viewer.scene.fog.far = far;
    },
  });
};

const fadeIn = async maxFogDistance => {
  tween({
    from: { far: 0 },
    to: { far: maxFogDistance },
    duration: 2000,
    easing: 'easeOutCubic',
    step: ({ far }) => {
      viewer.scene.fog.far = far;
    },
  });
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

    await fadeIn(25);

    setTimeout(async () => {
      await fadeOut();
      // Flip the scenes again
      floatingOrb.destroy();
      viewer.scene = mainScene;
      callback();
    }, param.duration);
  },
  async exit(callback) {
    fadeIn(300);
    callback();
  },
};
