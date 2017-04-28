import record from './record';
import review from './review';
import controllers from '../../controllers';
import instructions from '../../instructions';
import viewer from '../../viewer';
import router from '../../router';
import transition from '../../transition';

let unmountStep;

const components = {
  record,
  review,
};

const goto = async (step) => {
  if (unmountStep) {
    unmountStep();
    unmountStep = null;
  }
  const component = components[step];
  if (component) {
    unmountStep = await components[step](goto);
  } else {
    router.navigate(step);
  }
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
    instructions.remove();
    if (unmountStep) {
      unmountStep();
      unmountStep = null;
    }
  },
};
