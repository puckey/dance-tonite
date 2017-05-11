import 'babel-polyfill';

import './theme/index.scss';
import * as THREE from './lib/three';
import { installRouter } from './routes';
import props from './props';
import feature from './utils/feature';
import Room from './room';
import hud from './hud';
import viewer from './viewer';
import audioPool from './utils/audio-pool';

window.THREE = THREE;

(async () => {
  await Promise.all([
    props.prepare(),
    feature.prepare().then(hud.prepare),
  ]);

  // If we are on a mobile device, we need a touch event in order
  // to play the audio:
  if (feature.isMobile) {
    hud.hideLoader();
    Room.reset();
    viewer.switchCamera('orthographic');
    await new Promise((resolve) => {
      hud.create('div.play-button', {
        onclick: function () {
          this.classList.add('mod-hidden');
          audioPool.fill();
          resolve();
        },
      }, 'Press to Dance Tonite');
    });
  }

  installRouter();
})();
