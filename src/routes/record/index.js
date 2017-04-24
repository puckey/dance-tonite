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

const toggleVR = () => {
  if (viewer.vrEffect.isPresenting) {
    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  } else {
    viewer.vrEffect.requestPresent().then(() => {
      viewer.switchCamera('default');
    });
  }
};

export default {
  hud: {
    menuEnter: toggleVR,
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
