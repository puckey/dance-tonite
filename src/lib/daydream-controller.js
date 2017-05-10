/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author puckey
 */

import emitter from 'mitt';

const findGamepad = () => {
  // iterate across gamepads as the Daydream Controller may not be in position 0
  const gamepads = navigator.getGamepads();
  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i];
    if (gamepad && gamepad.id === 'Daydream Controller') {
      return gamepad;
    }
  }
};

const controller = Object.assign(
  emitter(),
  {
    update: () => {
      const gamepad = findGamepad();
      if (gamepad === undefined) return;
      const { pressed } = gamepad.buttons[0];
      if (controller.pressed !== pressed) {
        controller.pressed = pressed;
        controller.emit(pressed ? 'touchpaddown' : 'touchpadup');
      }
    },
  }
);

export default controller;
