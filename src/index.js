/** @jsx h */
import 'babel-polyfill';
import { h, render } from 'preact';

import './theme/index.scss';
import * as THREE from './lib/three';
import { installRouter } from './routes';
import props from './props';
import feature from './utils/feature';
import Room from './room';
import viewer from './viewer';
import audioPool from './utils/audio-pool';
import PressPlayToStart from './containers/PressPlayToStart';

window.THREE = THREE;

(async () => {
  await Promise.all([
    props.prepare(),
    feature.prepare(),
  ]);
  const removeElement = (selector) => {
    document.querySelector(selector).remove();
  };

  // If we are on a mobile device, we need a touch event in order
  // to play the audio:
  if (feature.isMobile) {
    Room.reset();
    viewer.switchCamera('orthographic');
    await new Promise((resolve) => {
      let root;
      const fillPool = () => {
        audioPool.fill();
        render(() => null, document.body, root);
        resolve();
      };
      removeElement('.spinner');
      root = render(
        <PressPlayToStart onClick={fillPool} />,
        document.body
      );
    });
  }
  removeElement('#initial');
  installRouter();
})();
