import createTweener from './utils/tween';

import props from './props';
import viewer from './viewer';
import settings from './settings';
import { Color } from './lib/three';
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

    const scale = this.scale = this.mesh.scale;
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
