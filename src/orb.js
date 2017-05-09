import tween from './utils/tween';

import props from './props';
import viewer from './viewer';
import settings from './settings';
import { Color } from './lib/three';

const BLACK = new Color(0, 0, 0);

export default class Orb {
  constructor(scene) {
    this.mesh = props.sphere.clone();
    this.mesh.material = this.mesh.material.clone();
    const position = this.mesh.position;
    position.y = settings.holeHeight;
    position.z = 1000;
    (scene || viewer.scene).add(this.mesh);
  }

  _fade(from, to) {
    tween(
      this.mesh.material.color.copy(from),
      Object.assign({
        ease: 'easeOutCubic',
        duration: 2,
      }, to)
    );
  }

  hide() {
    viewer.scene.remove(this.mesh);
  }

  show() {
    viewer.scene.add(this.mesh);
  }

  fadeOut() {
    this._fade(settings.sphereColor, BLACK);
  }

  fadeIn() {
    this._fade(BLACK, settings.sphereColor);
  }

  move(z) {
    this.mesh.position.z = z;
  }

  destroy() {
    viewer.scene.remove(this.mesh);
  }
}
