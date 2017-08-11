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
import createTweener from './utils/tween';

import props from './props';
import viewer from './viewer';
import settings from './settings';
import { Color } from '../third_party/threejs/three';
import { orbColor, highlightColor } from './theme/colors';

const BLACK = new Color(0, 0, 0);

export default class Orb {
  constructor(scene) {
    this.mesh = props.sphere.clone();
    this.mesh.material = this.mesh.material.clone();
    this.defaultColor = this.mesh.material.color.getHex();

    const position = this.position = this.mesh.position;
    position.y = settings.holeHeight;
    position.z = 1000;
    (scene || viewer.scene).add(this.mesh);
    this.tween = createTweener();
  }

  _fade(from, to) {
    this.tween(
      this.mesh.material.color.copy(from),
      Object.assign({
        ease: 'easeOutCubic',
        duration: 2,
      }, to)
    );
  }

  set visible(visible) {
    this.mesh.visible = visible;
  }

  fadeOut() {
    this._fade(orbColor, BLACK);
  }

  fadeIn() {
    this._fade(BLACK, orbColor);
  }

  destroy() {
    viewer.scene.remove(this.mesh);
  }

  highlight() {
    this.mesh.material.color.copy(highlightColor);
  }

  unhighlight() {
    this.mesh.material.color.setHex(this.defaultColor);
  }
}
