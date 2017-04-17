import { tween } from 'shifty';

import props from './props';
import viewer from './viewer';
import settings from './settings';
import { Color } from './lib/three';

const BLACK = new Color(0, 0, 0);

export default class Orb {
  constructor() {
    this.mesh = props.sphere.clone();
    this.mesh.material = this.mesh.material.clone();
    this.mesh.position.y = settings.holeHeight;
    viewer.scene.add(this.mesh);
  }

  fadeOut() {
    this.mesh.material.color.copy(settings.sphereColor);
    tween({
      from: settings.sphereColor,
      to: BLACK,
      duration: 2000,
      easing: 'easeOutCubic',
      step: color => {
        this.mesh.material.color.copy(color);
      },
    });
  }

  move(z) {
    this.mesh.position.z = z;
  }

  destroy() {
    viewer.scene.remove(this.mesh);
  }
}
