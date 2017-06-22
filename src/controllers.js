import emitter from 'mitt';
import * as SDFText from './sdftext';
import Props from './props';
import viewer from './viewer';
import settings from './settings';
import * as THREE from './lib/three';


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

  //  Which hand is this? Unfortunately I've found the reporting of handedness
  //  from the Gamepad API is not reliably available. Just have to compensate.
  //  This logic is convoluted but the goal its "do the best you can".
  //  NOTE: What was the "avoid non-handedness of oculus remote" issue??
  if (controller.gamepad.hand === 'left') {
    if (leftController.gamepad === undefined) {
      controller.hand = 'left';
    } else {
      controller.hand = 'right';
    }
  } else if (controller.gamepad.hand === 'right') {
    if (rightController.gamepad === undefined) {
      controller.hand = 'right';
    } else {
      controller.hand = 'left';
    }

  //  Reaching this point means gamepad.hand has no usefull value
  //  so we'll just assign this controller to whichever hand is available.
  } else if (leftController.gamepad === undefined) {
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

  const handlePress = () => {
    if (controller.hand === 'left') handleLeftPress();
    else handleRightPress();
  };

  //  For Vive, it's so straight forward.
  controller.addEventListener('thumbpad press began', handlePress);

  //  For Oculus we need to add a little more flexibility...
  controller.addEventListener('thumbstick press began', handlePress);
  controller.addEventListener('A press began', handlePress);
  controller.addEventListener('B press began', handlePress);

  // On vive also listen for menu presses, since the menu button is also on the
  // front of the controller:
  if (isVive) {
    controller.addEventListener('menu press began', handlePress);
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
      addController(controller);
      controller.removeEventListener(onHandChanged);
    };
    controller.addEventListener('hand changed', onHandChanged);
  } else addController(controller);
});


//  Still worried multiple VRController instances are being left in the scene
//  after a few disconnects and reconnects? Check it for yourself!
// window.kids = viewer.scene.children;


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
  wrapWidth: 1980, // was originally 1600.
  scale: 0.25,
  align: 'right',
  color: settings.textColor,
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
      controller.matrix.decompose(POSITION, ROTATION, SCALE);
      const { x, y, z } = POSITION.add(position).sub(viewer.camera.position);
      controller.matrix.copyPosition(MATRIX.makeTranslation(x, y, z));
    }
  };
}());

export default controllers;
