import 'babel-polyfill';
import 'webvr-polyfill';

// if we're on a mobile device that doesn't support WebVR, use polyfill
if (feature.isMobile && (navigator.getVRDisplays === undefined)) {
  window.WebVRConfig.BUFFER_SCALE = 0.75;
  window.polyfill = new window.WebVRPolyfill();
  console.log('WebVR polyfill...', navigator.getVRDisplays);
}

import './theme/index.scss';
import * as THREE from './lib/three';
import { installRouter } from './routes';
import props from './props';
import feature from './utils/feature';
import Room from './room';
import hud from './hud';
import viewer from './viewer';
import audioPool from './utils/audio-pool';
import playIconSvg from './hud/icons/play.svg';

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
      const play = hud.create('div.loader-overlay', hud.create('div.play-button.mod-fill', {
        onclick: function () {
          play.classList.add('mod-hidden');
          audioPool.fill();
          resolve();
        },
      }), hud.create('div.play-button-text', 'Press play to Dance Tonite'));
      document.querySelector('.play-button').innerHTML = playIconSvg;
    });
  }

  const { aboutButton, muteButton } = hud.elements;
  aboutButton.classList.remove('mod-hidden');
  muteButton.classList.remove('mod-hidden');

  installRouter();
})();
