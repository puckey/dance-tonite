import { Group } from './lib/three';
import * as SDFText from './sdftext';
import viewer from './viewer';
import settings from './settings';

const { scene } = viewer;
const textCreator = SDFText.creator();
const { textColor } = settings;

const group = new Group();

//  for alignment testing
// const mesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({wireframe:true}) );
// group.add( mesh );

const subtext = textCreator.create('START IN', {
  scale: 4.5,
  align: 'center',
  color: textColor,
  mode: 'nowrap'
});

const mainText = textCreator.create('8', {
  scale: 15,
  align: 'center',
  color: textColor,
  mode: 'nowrap'
});

//  BMFontText refusing to align center
mainText.position.x = 0.1;
mainText.position.y = -0.65;

group.add( subtext, mainText );

group.position.set( 0, 2, -4 );

export default {
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

  beginCountdown( seconds ){
    mainText.updateLabel( seconds.toString() );

    return new Promise( function( resolve ){
      let secondsRemaining = seconds;

      let interval = window.setInterval( function(){
        secondsRemaining--;
        mainText.updateLabel( secondsRemaining.toString() );
        if( secondsRemaining <= 0 ){
          window.clearInterval( interval );
          resolve();
        }
      }, 1000 );
    });
  }
};
