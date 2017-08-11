/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as THREE from '../../third_party/threejs/three';
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
