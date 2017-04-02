import props from './props';
import viewer from './viewer';
import settings from './settings';

export default class Orb {
  constructor() {
    this.mesh = props.sphere.clone();
    this.mesh.position.y = settings.holeHeight;
    viewer.scene.add(this.mesh);
  }

  move(z) {
    this.mesh.position.z = z;
  }

  destroy() {
    viewer.scene.remove(this.mesh);
  }
}
