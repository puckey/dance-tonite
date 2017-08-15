/** @jsx h */
import 'babel-polyfill';
import { h, render } from 'preact';

import './theme/index.scss';
import * as THREE from './lib/three';
import router from './router';
import props from './props';
import Router from './containers/Router';
import viewer from './viewer';
import transition from './transition';
import deps from './deps';
import feature from './utils/feature';
import analytics from './utils/analytics';
import prepareMobile from './utils/prepare-mobile';

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
    // if we're on a mobile phone that doesn't support WebVR, use polyfill
    new Promise((resolve) => {
      if (!feature.vrPolyfill) return resolve();
      require.ensure([], function (require) {
        require('webvr-polyfill');
        window.WebVRConfig.BUFFER_SCALE = 0.75;
        window.polyfill = new window.WebVRPolyfill();
        console.log('WebVR polyfill');
        resolve();
      });
    }),
  ]);
  await feature.prepare();
  await deps.prepare();
  if (feature.has6DOF) {
    transition.prepare();
  }
  viewer.prepare();
  if (feature.isMobile) {
    prepareMobile();
  }
  const el = document.getElementById('initial');
  el.parentNode && el.parentNode.removeChild(el);
  render(<Router />, document.body, root);
  analytics.mount();
})();

// if we're in production mode, use service worker
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  });
}