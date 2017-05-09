import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';
import router from './router';

const [leftController, rightController] = viewer.controllers;

const textCreator = SDFText.creator();

const rhand = Props.controller.clone();
const lhand = Props.controller.clone();
rhand.children[0].castShadow = lhand.children[0].castShadow = true;

const rText = textCreator.create('', {
  wrapWidth: 1600,
  scale: 0.25,
  align: 'left',
  color: settings.textColor,
});
const lText = textCreator.create('', {
  wrapWidth: 1600,
  scale: 0.25,
  align: 'right',
  color: settings.textColor,
});
rhand.add(rText);
lhand.add(lText);

rText.rotation.x = lText.rotation.x = -Math.PI * 0.5;
rText.position.set(0.03, 0, -0.022);
lText.position.set(-0.12, 0, -0.022);

let leftPress;
let rightPress;

leftController.addEventListener('thumbpaddown', () => {
  if (leftPress) leftPress();
});

rightController.addEventListener('thumbpaddown', () => {
  if (rightPress) rightPress();
});

const rButton = rhand.getObjectByName('button');
const lButton = lhand.getObjectByName('button');

function setButtonVisibility(hand, flag) {
  const button = (hand === 'left') ? lButton : rButton;
  button.visible = flag;
}

const removeLeft = () => {
  lText.updateLabel('');
  leftPress = null;
  setButtonVisibility('left', false);
};

const removeRight = () => {
  rText.updateLabel('');
  rightPress = null;
  setButtonVisibility('right', false);
};

let currentParam;
export default {
  update(param) {
    if (param === currentParam) return;
    currentParam = param;
    const { left, right, removeOnPress } = param || {};
    if (left) {
      lText.updateLabel(left.text);
      if (left.onPress) {
        setButtonVisibility('left', true);
      }
      leftPress = () => {
        if (left.removeOnPress || removeOnPress) {
          removeLeft();
        }
        if (removeOnPress) {
          removeRight();
        }
        if (left.onPress) {
          left.onPress();
        }
      };
    } else {
      removeLeft();
    }

    if (right) {
      rText.updateLabel(right.text);
      if (right.onPress) {
        setButtonVisibility('right', true);
      }
      rightPress = () => {
        if (right.removeOnPress || removeOnPress) {
          removeRight();
        }
        if (removeOnPress) {
          removeLeft();
        }
        if (right.onPress) {
          right.onPress();
        }
      };
    } else {
      removeRight();
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

  setButtonVisibility,
};


//  # googleIO2017
const MENU_PRESS_RESET_TIME = 3000;
let menuPressTime;
leftController.addEventListener('menudown', menuHeld);

function menuHeld(){
  menuPressTime = Date.now();
  leftController.addEventListener('menuup', menuReleased);
}

function menuReleased(){
  if( Date.now() - menuPressTime > MENU_PRESS_RESET_TIME ){
    console.log( 'resetting' );
    router.navigate('/');
  }
  leftController.removeEventListener('menuup', menuReleased );
}
