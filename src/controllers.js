/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import emitter from 'mitt';
import Props from './props';
import viewer from './viewer';
import * as THREE from '../third_party/threejs/three';
import { textColor } from './theme/colors';
import deps from './deps';

//  These are empty objects -- but we'll fill them soon.
let [leftController, rightController] = viewer.controllers;
const controllerGroup = new THREE.Group();

function handleLeftPress() {
  if (leftPress) leftPress();
}
function handleRightPress() {
  if (rightPress) rightPress();
}

function addController(controller) {
  //  We're only interested in Vive or Oculus controllers right now.
  const isVive = controller.gamepadStyle !== 'vive';
  if (isVive && controller.gamepadStyle !== 'oculus') {
    return;
  }

  //  For 6DOF systems we need to add the VRControls standingMatrix
  //  otherwise your controllers will be on the floor!
  controller.standingMatrix = viewer.controls.getStandingMatrix();

  //  This is for if we do add Daydream controller support here,
  //  we'd need access to the camera (your head) position so we could
  //  guess where the 3DOF controller is in relation to your head.
  controller.head = viewer.cameras.default;

  //  Ok... Earlier efforts to outsmart the Gamepad API's (and Steam's)
  //  reporting of handedness has failed. So we're giving up and only
  //  allowing a controller to mount if it indeed contains a valid "left"
  //  or "right" in the gamepad.hand property. And note that this CAN CHANGE!
  //  So let's roll with it and store the gamepad's current handedness
  //  right on the controller. And if the gamepad's handedness changes we'll
  //  catch that through an event and swap them. But for now:
  if (controller.gamepad.hand === 'left') {
    controller.hand = 'left';
  } else {
    controller.hand = 'right';
  }

  //  Now that we've made a decision about handedness we can assign this controller
  //  to either leftController or rightController and add the appropriate mesh.
  let mesh;
  if (controller.hand === 'left') {
    viewer.controllers[0] = leftController = controller;
    mesh = lhand;
  } else {
    viewer.controllers[1] = rightController = controller;
    mesh = rhand;
  }
  controller.add(mesh);

  //  Button events!
  const handlePress = () => {
    if (controller.hand === 'left') handleLeftPress();
    else handleRightPress();
  };
  //  For Vive, it's pretty straight forward.
  if (controller.gamepadStyle === 'vive') {
    controller.addEventListener('thumbpad press began', handlePress);
    //  And we'll also listen for the Menu button because it's on the front
    //  and we're trying to be accomodating to inaccurate thumbs.
    controller.addEventListener('menu press began', handlePress);
  }
  //  For Oculus we need to add a little more flexibility...
  if (controller.gamepadStyle === 'oculus') {
    controller.addEventListener('thumbstick press began', handlePress);
    controller.addEventListener('A press began', handlePress);//  RIGHT controller.
    controller.addEventListener('B press began', handlePress);//  RIGHT controller.
    controller.addEventListener('X press began', handlePress);//  LEFT controller.
    controller.addEventListener('Y press began', handlePress);//  LEFT controller.
  }

  //  On disconnect we need to remove the mesh
  //  and destroy the controller.
  //  The mesh (lhand or rhand) should continue to exist
  //  which is good because we'll need it again if the controller reconnects.
  controller.addEventListener('disconnected', () => {
    controller.remove(mesh);
    controllerGroup.remove(controller);
    if (controller.hand === 'left') {
      viewer.controllers[0] = leftController = {};
    } else {
      viewer.controllers[1] = rightController = {};
    }
  });

  //  We're going to add this directly onto the controller which will yield
  //  no harm in production, and for dev creates the benefit of being able to
  //  directly test how this should work. We can now call things like:
  //  THREE.VRController.controllers[0].onHandChanged("left");
  //  THREE.VRController.controllers[1].onHandChanged("right");
  //  THREE.VRController.controllers[0].onHandChanged("right");
  //  THREE.VRController.controllers[1].onHandChanged("left");
  //  Notice what we're NOT doing. We're NOT SWAPPING controllers. We are
  //  relying entirely on the Gamepad API to report a "swap" by reporting a
  //  change event on both controllers independently.
  controller.onHandChanged = (forceHand) => {
    let hand;
    //  This forceHand is only for manual testing of this swap feature.
    //  If doing manual swap tests send a 'left' or 'right' string only.
    //  In "normal mode" this is just an event listener and will therefore
    //  receive a full event object and so the following string comnpare
    //  will fail and use the actual gamepad.hand value -- a good thing!
    if (forceHand === 'left' || forceHand === 'right') {
      hand = forceHand;
    } else hand = controller.gamepad.hand;
    // console.log('This controller has swapped hands!', controller, hand);
    controller.remove(mesh);
    controller.hand = hand;
    if (hand === 'left') {
      viewer.controllers[0] = leftController = controller;
      mesh = lhand;
    } else {
      viewer.controllers[1] = rightController = controller;
      mesh = rhand;
    }
    controller.add(mesh);
  };
  controller.addEventListener('hand changed', controller.onHandChanged);

  //  All our work here is done, let's add this controller to the scene!
  //  Well sort off... We’ll add it to our controllerGroup which has already
  //  been added to viewer.scene. This was we can more cleanly show and hide
  //  whatever’s connected.
  // (And yes, Jonathan -- we will remove it on disconnect and destroy it.)
  controllerGroup.add(controller);
}


window.addEventListener('vr controller connected', ({ detail: controller }) => {
  //  If .hand is an empty String, null, or undefined...
  if (!controller.gamepad.hand) {
    //  Tempted to add a setTimeOut here so if a "hand changed" event doesn't fire
    //  within a second or two we just assign a hand. HOWEVER if the controllers
    //  are already turned on and a button was pressed, then window refreshed
    //  the controllers will show up with hand === '' and event won't fire until
    //  Tutorial Mode is exited! So if you left Tutorial running for 5 minutes
    //  the "hand changed" event won't hand a chance to fire during that time.
    //  Unclear why... But if we believe this event WILL FIRE EVENTUALLY then
    //  this current setup is totally fine.
    const onHandChanged = () => {
      controller.removeEventListener(onHandChanged);
      addController(controller);
    };
    controller.addEventListener('hand changed', onHandChanged);
  } else addController(controller);
});


//  Still worried multiple VRController instances are being left in the scene
//  after a few disconnects and reconnects? Check it for yourself!
// window.kids = viewer.scene.children;


const textCreator = deps.SDFText.creator();

const rhand = Props.controller.clone();
const lhand = Props.controller.clone();
rhand.children[0].castShadow = lhand.children[0].castShadow = true;

const rText = textCreator.create('', {
  wrapWidth: 1980, //was originally 1600
  scale: 0.25,
  align: 'left',
  color: textColor.getHex(),
});
const lText = textCreator.create('', {
  wrapWidth: 1980, // was originally 1600.
  scale: 0.25,
  align: 'right',
  color: textColor.getHex(),
});
rhand.add(rText);
lhand.add(lText);

rText.rotation.x = lText.rotation.x = -Math.PI * 0.5;
rText.position.set(0.03, 0, -0.022);
//  Original left text position was:
// lText.position.set(-0.12, 0, -0.022);
//  So... x = 1980/1600*-0.12 roughly anyhow...
lText.position.set(-0.1485, 0, -0.022);

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
      viewer.scene.add(controllerGroup);
    },
    remove() {
      rightPress = leftPress = null;
      viewer.scene.remove(controllerGroup);
    },
    setButtonVisibility,
  },
);

controllers.countActiveControllers = () => +!!leftController.gamepad + +!!rightController.gamepad;

controllers.fixToPosition = (function () {
  const MATRIX = new THREE.Matrix4();
  const POSITION = new THREE.Vector3();
  const ROTATION = new THREE.Quaternion();
  const SCALE = new THREE.Vector3();
  return (position) => {
    for (let i = 0; i < viewer.controllers.length; i++) {
      const controller = viewer.controllers[i];
      if (!controller.matrix) return;
      controller.matrix.decompose(POSITION, ROTATION, SCALE);
      const { x, y, z } = POSITION.add(position).sub(viewer.camera.position);
      controller.matrix.copyPosition(MATRIX.makeTranslation(x, y, z));
    }
  };
}());

export default controllers;
