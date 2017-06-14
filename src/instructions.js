import { Group } from './lib/three';
import * as SDFText from './sdftext';
import viewer from './viewer';
import settings from './settings';
import { sleep } from './utils/async';

const { scene } = viewer;
const textCreator = SDFText.creator();
const { textColor } = settings;

const group = new Group();
let countdownVersion = 0;
let mainTextString;
let subTextString;

//  for alignment testing
// const mesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({wireframe:true}) );
// group.add( mesh );

const subtext = textCreator.create('START IN', {
  scale: 2.25,
  align: 'center',
  color: textColor,
  mode: 'nowrap',
});

const mainText = textCreator.create('', {
  scale: 7.5,
  align: 'center',
  color: textColor,
  mode: 'nowrap',
});

mainText.position.y = -0.65;

group.add(subtext, mainText);

group.position.set(0, 2, -4);

const instructions = {
  add() {
    scene.add(group);
  },

  remove() {
    scene.remove(group);
  },

  reset() {
    countdownVersion += 1;
    instructions.remove();
    instructions.setSubText('');
    instructions.setMainText('');
  },

  setSubText(str) {
    if (str === subTextString) return;
    subtext.updateLabel(str);
    subTextString = str;
  },

  setMainText(str) {
    if (str === mainTextString) return;
    mainText.updateLabel(str);
    mainTextString = str;
  },

  async beginCountdown(seconds) {
    countdownVersion += 1;
    const version = countdownVersion;
    instructions.add();
    let remaining = seconds;
    while (remaining > -2) {
      if (version !== countdownVersion) {
        remaining = -2;
        continue;
      }
      if (remaining > 0) {
        instructions.setMainText(remaining.toString());
      } else {
        instructions.setMainText('');
        instructions.setSubText('DANCE!');
      }
      remaining--;
      await sleep(1000);
    }
    if (version === countdownVersion) {
      instructions.remove();
    }
  },
};

export default instructions;
