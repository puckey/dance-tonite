import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';

const textCreator = SDFText.creator();
let [leftController, rightController] = viewer.controllers;
let leftPress;
let rightPress;




//THREE.VRController.verbosity=1;
//console.log( THREE.VRController.controllers )


//console.log('can has window events?', window.addEventListener)

window.addEventListener('vr controller connected', (event) => {
  const controller = event.detail;
  //  Can take this further and see if controller.gamepad.hand contains a "left" or "right" string.
  //  (It's blank half the time... very unreliable!)
  const handedness = leftController.gamepad===undefined ? 'left' : 'right'
  controller.standingMatrix = viewer.controls.getStandingMatrix();//  For 6DOF VR rigs.
  controller.head = viewer.cameras.default;//  For 3DOF VR rigs.
  viewer.scene.add(controller);


  const hand = Props.controller.clone();
  hand.children[0].castShadow = true;
  controller.add(hand);
  const text = textCreator.create('', {
    wrapWidth: 1600,
    scale: 0.25,
    align: handedness,
    color: settings.textColor,
  });
  hand.add(text);
  text.rotation.x = -Math.PI * 0.5;
  if (handedness==='left') text.position.set(-0.12, 0, -0.022);
  else text.position.set(0.03, 0, -0.022);

  controller.setButtonVisibility = ( flag ) => {
    hand.getObjectByName('button').visible = flag;
  }

  function handlePress(){
    if (handedness==='left' && leftPress) leftPress();
    if (handedness==='right' && rightPress) rightPress();
    //console.log('press event began',handedness)
  }
  if (controller.style==='rift') {
    controller.addEventListener('primary press began', handlePress);
    controller.addEventListener('primary press ended', handlePress);
  }
  else {
    controller.addEventListener('thumbpad press began', handlePress);
    controller.addEventListener('thumbpad press ended', handlePress);
  }

  controller.updateOn = ( options ) => {
    text.updateLabel(options.text);
    if (options.onPress) controller.setButtonVisibility(true);
    if (handedness==='left'){
      leftPress = () => {
        if (options.removeOnPress) {
          text.updateLabel('');
          leftPress = null;
          controller.setButtonVisibility(false);
        }
        if (options.onPress) options.onPress();
      };
    }
    else if(handedness==='right'){
      rightPress = () => {
        if (options.removeOnPress) {
          text.updateLabel('');
          rightPress = null;
          controller.setButtonVisibility(false);
        }
        if (options.onPress) options.onPress();
      };
    }
  };
  controller.updateOff = ( options ) => {
    text.updateLabel('');
    if (handedness==='left') leftPress = null;
    else if(handedness==='right') rightPress = null;
    controller.setButtonVisibility(false);
  };


  controller.addEventListener('disconnected', ( event )=>{
    controller.visible=false;
  });


  //  Export as either left or right.

  if (handedness==='left') leftController = controller;
  else if (handedness==='right') rightController = controller;


  //  Oh, and we ought to patch viewer{} as well.
  //  Not so elegant, but necessary for a quick fix.

  viewer.controllers[0] = leftController;
  viewer.controllers[1] = rightController;

}, false);




export default {
  update({ left, right } = {}) {
    if(leftController.gamepad){//  Did we find this controller?
      if (left) leftController.updateOn(left);
      else leftController.updateOff(left);
    }
    if(rightController.gamepad){//  Did we find this controller?
      if (right) rightController.updateOn(right);
      else rightController.updateOff(right);
    }
  },

  add() {
    leftController.visible  = true;
    rightController.visible = true;
  },

  remove() {
    rightPress = leftPress  = null;
    leftController.visible  = false;
    rightController.visible = false;
  },

  setButtonVisibility( hand, flag ){//  Quick hack...
    if(hand==='left') leftController.setButtonVisibility(flag)
    else if(hand==='right') rightController.setButtonVisibility(flag)
  },
};