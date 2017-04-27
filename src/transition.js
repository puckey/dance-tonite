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
const text = textCreator.create('', {
  wrapWidth: 4000,
  scale: 15,
  align: 'center',
  color: settings.textColor,
});

transitionScene.add(text);
transitionScene.add(props.grid);

let time = 0;
let floatingOrb;
const tick = dt => {
  time += dt;
  floatingOrb.mesh.position.y = Math.sin(time * 2) / 4 + 2;
};

const tweenFog = (from, to, callback) => {
  viewer.scene.fog.far = from;
  const tweener = tween(
    viewer.scene.fog,
    {
      far: to,
      ease: 'easeOutCubic',
      duration: 2,
    }
  );
  if (callback) {
    tweener.on('complete', callback);
  }
};

const fadeOut = callback => {
  tweenFog(25, 0, callback);
};

const fadeIn = (maxFogDistance, callback) => {
  tweenFog(0, maxFogDistance, callback);
};

export default {
  enter(param, callback) {
    // welcome to callback hell
    fadeOut(() => {
      // Flip the scenes
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

      fadeIn(25, () => {
        setTimeout(() => {
          fadeOut(() => {
            // Flip the scenes again
            floatingOrb.destroy();
            viewer.scene = mainScene;
            callback();
          });
        }, param.duration);
      });
    });
  },
  exit(callback) {
    fadeIn(300, callback);
  },
};
