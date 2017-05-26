import * as THREE from './lib/three';
import Orb from './orb';

const SUPER_SIZE_ME = 50;

export default class MegaOrb extends Orb{
  constructor(scene) {
    super( scene );
    this.mesh.scale.setLength( SUPER_SIZE_ME );
    this.mesh.material.side = THREE.DoubleSide;
  }
}
