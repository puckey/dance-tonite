import record from './record';
import review from './review';
import tutorial from './tutorial';
import instructions from '../../instructions';
import router from '../../router';
import hud from '../../hud';

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
        hud.clear();
      }
      const component = components[step];
      if (component) {
        unmountStep = await components[step](goto, req);
      } else {
        unmountStep = null;
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
