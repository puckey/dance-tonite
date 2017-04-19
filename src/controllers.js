import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';

const [leftController, rightController] = viewer.controllers;

const textCreator = SDFText.creator();

const rhand = Props.controller.clone();
const lhand = Props.controller.clone();
const rText = textCreator.create('');
const lText = textCreator.create('');
rhand.add(rText);
lhand.add(lText);

let leftPress;
let rightPress;

leftController.addEventListener('thumbpaddown', () => {
  if (leftPress) leftPress();
});

rightController.addEventListener('thumbpaddown', () => {
  if (rightPress) rightPress();
});

export default {
  update({ left, right } = {}) {
    if (left) {
      lText.updateLabel(left.text);
      leftPress = left.onPress;
    } else {
      lText.updateLabel('');
      leftPress = null;
    }

    if (right) {
      rText.updateLabel(right.text);
      rightPress = right.onPress;
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
};
