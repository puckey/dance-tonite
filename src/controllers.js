import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';

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

export default {
  update({ left, right } = {}) {
    if (left) {
      lText.updateLabel(left.text);
      if (left.onPress) {
        setButtonVisibility('left', true);
      }
      leftPress = () => {
        if (left.removeOnPress) {
          lText.updateLabel('');
          leftPress = null;
          setButtonVisibility('left', false);
        }
        if (left.onPress) {
          left.onPress();
        }
      };
    } else {
      lText.updateLabel('');
      leftPress = null;
      setButtonVisibility('left', false);
    }

    if (right) {
      rText.updateLabel(right.text);
      if (right.onPress) {
        setButtonVisibility('right', true);
      }
      rightPress = () => {
        if (right.removeOnPress) {
          rText.updateLabel('');
          rightPress = null;
          setButtonVisibility('right', false);
        }
        if (right.onPress) {
          right.onPress();
        }
      };
    } else {
      rText.updateLabel('');
      rightPress = null;
      setButtonVisibility('right', false);
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
