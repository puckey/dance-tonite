import 'babel-polyfill';

import './theme/index.scss';
import * as THREE from './lib/three';
import installRouter from './routes';
import props from './props';
import feature from './utils/feature';
import Room from './room';
import hud from './hud';

window.THREE = THREE;

Promise.all([
  props.prepare(),
  feature.prepare().then(hud.prepare),
]).then(() => {
  Room.reset();
  installRouter();
});
