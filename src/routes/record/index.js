import record from './record';
import review from './review';
import controllers from '../../controllers';
import viewer from '../../viewer';

let unmountStep;

const components = {
  record,
  review,
};

const goto = (step) => {
  if (unmountStep) {
    unmountStep();
  }
  unmountStep = components[step](goto);
};

export default {
  hud: {
    menuEnter: viewer.toggleVR,
  },

  mount: () => {
    controllers.add();
    goto('record');
  },

  unmount: () => {
    controllers.remove();
    unmountStep();
    unmountStep = null;
  },
};

