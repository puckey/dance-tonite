import record from './record';
import review from './review';
import controllers from '../../controllers';

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
  hud: {},

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

