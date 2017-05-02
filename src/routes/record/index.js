import record from './record';
import review from './review';
import tutorial from './tutorial';
import controllers from '../../controllers';
import instructions from '../../instructions';
import viewer from '../../viewer';
import router from '../../router';

let unmountStep;

const components = {
  record,
  review,
  tutorial,
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
    goto('tutorial');
  },

  unmount: () => {
    instructions.remove();
    if (unmountStep) {
      unmountStep();
      unmountStep = null;
    }
  },
};
