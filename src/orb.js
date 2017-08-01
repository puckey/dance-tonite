import createTweener from './utils/tween';

import props from './props';
import viewer from './viewer';
import settings from './settings';
import { Color } from './lib/three';
import { orbColor, highlightColor } from './theme/colors';

const BLACK = new Color(0, 0, 0);

const pulseBeats = [
  0.00, 0.125, 0.50, 0.750,
  1.00, 1.125, 1.50, 1.750
];

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

  scaleFromAudioTime(time) {
    const loopProgress = time % (settings.loopDuration / 4)

    let scale = 1;
    const pulseLength = 0.15;
    const pulseScale = 0.75;

    for (let i = 0; i < pulseBeats.length; i++) {
      if (loopProgress < pulseBeats[i]) break;

      if ((loopProgress - pulseBeats[i]) < pulseLength) {
        let scaleIncrease = 0.10;
        if (i === 7) scaleIncrease = 0.20;

        // linear fade out
        const ratio = 1 - ((loopProgress - pulseBeats[i]) / pulseLength);

        scale = 1 + (scaleIncrease * pulseScale * ratio);

        break;
      }
    }
    this.mesh.scale.setScalar(scale);
  }
}
