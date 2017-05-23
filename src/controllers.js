import emitter from 'mitt';

import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';
import feature from './utils/feature';
import { mount } from './routes/';
import transition from './transition';

// const [leftController, rightController] = viewer.controllers;

let leftController;
let rightController;

const controllerViewGroup = new THREE.Group();
window.cg = controllerViewGroup;

function handleLeftPress(){
  if (leftPress) leftPress();
}

function handleRightPress(){
  if (rightPress) rightPress();
}

viewer.events.on('controllerConnected', function( controller ){

  let mesh;
  if( controller.gamepad.hand === 'left' ){
    leftController = controller;
    controller.addEventListener('thumbpad press began', handleLeftPress );
    mesh = lhand;

  }
  else{
    rightController = controller;
    controller.addEventListener('thumbpad press began', handleRightPress );
    mesh = rhand;
  }
  controller.add( mesh );

  controllerViewGroup.add( controller );

  controller.addEventListener( 'vr controller disconnected', function(){
    controllerViewGroup.remove( controller );
    controller.remove( mesh );
  });
});

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
const controllers = Object.assign(
  emitter(),
  {
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
      viewer.scene.add( controllerViewGroup );
    },

    remove() {
      rightPress = leftPress = null;
      viewer.scene.remove( controllerViewGroup );
    },

    setButtonVisibility,
  }
);

// #googleIO2017: emit 'menulongpress' and 'triggerlongpress' events for Vive station:
if (feature.isIOVive) {
  const PRESS_RESET_TIME = 2000;
  const subscribe = (controller, buttonName) => {
    let timeOutId;

    controller.addEventListener(`${buttonName}down`, () => {
      timeOutId = setTimeout(
        () => controllers.emit(`${buttonName}longpress`),
        PRESS_RESET_TIME
      );
    });

    controller.addEventListener(
      `${buttonName}up`,
      () => clearTimeout(timeOutId)
    );
  };

  // Add menu and trigger long press events for both controllers:
  [leftController, rightController].forEach(controller => {
    ['menu', 'trigger'].forEach(event => subscribe(controller, event));
  });

  controllers.on('menulongpress', () => {
    transition.reset();
    mount('record');
  });
}

export default controllers;

