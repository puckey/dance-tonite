import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';

const textCreator = SDFText.creator();
let [leftController, rightController] = viewer.controllers;
let leftPress;
let rightPress;




THREE.VRController.verbosity=1;


window.addEventListener('vr controller connected', (event) => {
  const controller = event.detail;
  const handedness = leftController.style===undefined ? 'left' : 'right'
  controller.standingMatrix = controls.getStandingMatrix();//  For 6DOF VR rigs.
  controller.head = viewer.cameras.default;//  For 3DOF VR rigs.
  viewer.scene.add(controller);

  const hand = Props.controller.clone();
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
    hand.getObjectByName( 'button' ).visible = flag;
  }




  console.log('controller connected!',handedness);


  //  I don't know where rightPress() and leftPress() are coming from
  //  so it's hard to make this more efficient by abtracting that to
  //  just press().

  controller.addEventListener('thumbpad press began', () => {
    if (handedness==='left' && leftPress) leftPress();
    if (handedness==='right' && rightPress) rightPress();
    console.log('thumbpad press began',handedness)
  })



/*
  if (controller.style==='rift') {
    controller.addEventListener('primary press began', (event) => {
      console.log('primary press began')//TODO: hook this up
    });
    controller.addEventListener('primary press ended', (event) => {
      console.log('primary press ended')//TODO: hook this up
    });
  }
  else {
    controller.addEventListener('thumbpad press began', (event) => {
      console.log('thumbpad press began')//TODO: hook this up
    });
    controller.addEventListener('thumbpad press ended', (event) => {
      console.log('thumbpad press ended')//TODO: hook this up
    });
  }*/




  if (handedness==='left') {

    leftController = controller
  }
  else if (handedness==='right') {

    rightController = controller
  }





}, false);











/*
leftController.addEventListener('thumbpaddown', () => {
  if (leftPress) leftPress();
});

rightController.addEventListener('thumbpaddown', () => {
  if (rightPress) rightPress();
});


const rButton = rhand.getObjectByName( 'button' );
const lButton = lhand.getObjectByName( 'button' );


function setButtonVisibility( hand, flag ){
  const button = (hand === 'left') ? lButton : rButton;
  button.visible = flag;
}
*/

export default {
  update({ left, right } = {}) {

    /*
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
    */
  },

  add() {
    leftController.visible=true;
    rightController.visible=true;
  },

  remove() {
    rightPress = leftPress = null;
    leftController.visible=false;
    rightController.visible=false;
  },

  setButtonVisibility( hand, flag ){//  Quick hack...
    this[hand+'Controller'].setButtonVisibility(flag)
  },
};
