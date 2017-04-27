import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';

const [leftController, rightController] = viewer.controllers;

const textCreator = SDFText.creator();

const rhand = Props.controller.clone();
const lhand = Props.controller.clone();
const rText = textCreator.create('', {
  wrapWidth: 1600,
  scale: 0.25,
  align: 'left',
  color: settings.textColor
});
const lText = textCreator.create('', {
  wrapWidth: 1600,
  scale: 0.25,
  align: 'right',
  color: settings.textColor
});
rhand.add(rText);
lhand.add(lText);

rText.rotation.x = lText.rotation.x = -Math.PI * 0.5;
rText.position.set( 0.03, 0, -0.022 );
lText.position.set(-0.12, 0, -0.022 );

let leftPress;
let rightPress;

leftController.addEventListener('thumbpaddown', () => {
  if (leftPress) leftPress();
});

rightController.addEventListener('thumbpaddown', () => {
  if (rightPress) rightPress();
});

function showButton(){
  Props.thumbpadMaterial.visible = true;
}

function hideButton(){
  Props.thumbpadMaterial.visible = false;
}

export default {
  update({ left, right } = {}) {

    if (left) {
      lText.updateLabel(left.text);
      if( left.removeOnPress ){
        showButton();
      }
      leftPress = () => {
        if (left.removeOnPress) {
          lText.updateLabel('');
          leftPress = null;
        }
        if (left.onPress) {
          left.onPress();
        }
      };
    } else {
      lText.updateLabel('');
      leftPress = null;
    }

    if (right) {
      rText.updateLabel(right.text);
      if( right.removeOnPress ){
        showButton();
      }
      rightPress = () => {
        if (right.removeOnPress) {
          showButton();
          rText.updateLabel('');
          rightPress = null;
        }
        if (right.onPress) {
          right.onPress();
        }
      };
    } else {
      rText.updateLabel('');
      rightPress = null;
    }
  },

  add() {
    leftController.add(lhand);
    rightController.add(rhand);
  },

  remove() {
    rightPress = leftPress = null;
    leftController.remove(lhand);
    rightController.remove(rhand);
  },

  showButton,
  hideButton

};
