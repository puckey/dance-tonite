import * as THREE from './lib/three';
import Orb from './orb';
import settings from './settings';
import layout from './room/layout';
import audio from './audio';

const megaSphereRadius = 64;
const megaOffset = 3;

const parallaxAlphaStart = 0.85;
const parallaxAlphaEnd = 1.0;
const parallaxAlphaDelta = parallaxAlphaEnd - parallaxAlphaStart;
const parallaxLength = 10;

export default class MegaOrb extends Orb{
  constructor(scene) {
    super( scene );

    const segmentsU = 128;
    const segmentsV = 64;
    this.mesh.geometry =  new THREE.SphereGeometry(
      megaSphereRadius,
      segmentsU,
      segmentsV,
    );
    this.mesh.material.side = THREE.DoubleSide;

    this.setPositionFromLayout();
  }

  setPositionFromLayout(){
    const room = layout.getRoom( layout.roomCount-1 );
    let [x,y,z] = room;
    x = x * settings.roomWidth;
    y = y * settings.roomHeight;
    z = z * settings.roomDepth + settings.roomOffset + megaSphereRadius + megaOffset;
    this.endPosition = new THREE.Vector3( x, y, -z );
    this.mesh.position.copy( this.endPosition );
  }

  setProgress( progress ){
    if( isNaN(progress) ){
      return;
    }

    const alpha = ( clamp( progress, parallaxAlphaStart, parallaxAlphaEnd ) - parallaxAlphaStart ) / parallaxAlphaDelta;
    const parallaxMove = -parallaxLength + parallaxLength * alpha;
    this.mesh.position.copy( this.endPosition );
    this.mesh.position.z -= parallaxMove;
  }
}

window.testMegaOrb = function(){
  audio.gotoTime(audio.duration - 90);
}

function clamp( value, min, max ) {
  return Math.max( min, Math.min( max, value ) );
}