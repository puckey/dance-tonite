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
  }
  document.getElementById('initial').remove();
  render(<Router />, document.body, root);
  analytics.mount();
})();
