import { Group } from './lib/three';
import * as SDFText from './sdftext';
import viewer from './viewer';
import settings from './settings';
import sleep from './utils/async';

const { scene } = viewer;
const textCreator = SDFText.creator();
const { textColor } = settings;

const group = new Group();

//  for alignment testing
// const mesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({wireframe:true}) );
// group.add( mesh );

const subtext = textCreator.create('START IN', {
  scale: 2.25,
  align: 'center',
  color: textColor,
  mode: 'nowrap'
});

const mainText = textCreator.create('8', {
  scale: 7.5,
  align: 'center',
  color: textColor,
  mode: 'nowrap'
});

mainText.position.y = -0.65;

group.add( subtext, mainText );

group.position.set( 0, 2, -4 );

const instructions = {
  add() {
    scene.add( group );
  },

  remove() {
    scene.remove( group );
  },

  setSubText( str ){
    subtext.updateLabel( str );
  },

  setMainText( str ){
    mainText.updateLabel( str );
  },

  async beginCountdown(seconds) {
    instructions.add();
    let remaining = seconds;
    while (remaining > 0) {
      instructions.setMainText(Math.floor(remaining).toString());
      const pause = 1 + remaining % 1;
      remaining -= pause;
      await sleep(pause * 1000);
    }
    instructions.remove();
  },
};

export default instructions;
