import 'babel-polyfill';

import './theme/index.scss';
import * as THREE from './lib/three';
import installRouter from './routes';
import props from './props';

window.THREE = THREE;

props.on('loaded', () => {
  installRouter();
});
