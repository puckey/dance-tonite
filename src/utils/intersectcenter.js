import * as THREE from '../lib/three';
import windowSize from '../utils/windowSize';

const mouse = new THREE.Vector2();
const screenCenter = new THREE.Vector2();
const CENTER_DISTANCE = 32 ** 2;

export default function (screenX, screenY) {
  if (screenX === undefined) return false;

  screenCenter.set(windowSize.width * 0.5, windowSize.height * 0.5);

  mouse.set(screenX, screenY);

  return screenCenter.distanceToSquared(mouse) < CENTER_DISTANCE;
}
