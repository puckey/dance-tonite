/** @jsx h */
import 'babel-polyfill';
import { h, render } from 'preact';

import './theme/index.scss';
import * as THREE from './lib/three';
import router from './router';
import props from './props';
import feature from './utils/feature';
import analytics from './utils/analytics';
import Router from './containers/Router';

window.THREE = THREE;

if (process.env.NODE_ENV === 'development') {
  require('preact/devtools');
}

if (process.env.FLAVOR === 'cms') {
  if (!localStorage.getItem('secret')) {
    router.navigate('/secret');
  }
}

(async () => {
  let root;
  await Promise.all([
    props.prepare(),
    feature.prepare(),
  ]);
  if (feature.isMobile) {
    document.body.classList.add('mod-mobile');

    // Disable pinch to zoom on mobile:
    // Source: https://stackoverflow.com/questions/37808180/disable-viewport-zooming-ios-10-safari/38573198#38573198
    document.addEventListener('touchmove', (event) => {
      if (event.scale !== 1) event.preventDefault();
    }, false);
  }
  document.getElementById('initial').remove();
  render(<Router />, document.body, root);
  analytics.mount();
})();
