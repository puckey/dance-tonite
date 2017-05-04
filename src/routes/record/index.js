import record from './record';
import review from './review';
import tutorial from './tutorial';
import instructions from '../../instructions';
import viewer from '../../viewer';
import router from '../../router';

let unmountStep;

const components = {
  record,
  review,
  tutorial,
};

export default {
  hud: { },
  mount: (req) => {
    const goto = async (step) => {
      if (unmountStep) {
        unmountStep();
        unmountStep = null;
      }
      const component = components[step];
      if (component) {
        unmountStep = await components[step](goto, req);
      } else {
        router.navigate(step);
      }
    };
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
