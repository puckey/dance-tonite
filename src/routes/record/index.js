import record from './record';
import review from './review';
import tutorial from './tutorial';
import instructions from '../../instructions';
import router from '../../router';
import hud from '../../hud';
import audio from '../../audio';

let current;

const components = {
  record,
  review,
  tutorial,
};

export default (req) => (
  {
    hud: { },
    mount: () => {
      const goto = (step) => {
        if (current) {
          current.unmount();
          hud.clear();
        }
        const component = components[step];
        if (component) {
          current = components[step](goto, req);
          current.mount();
        } else {
          current = null;
          router.navigate(step);
        }
      };
      // Start at tutorial:
      goto('tutorial');
    },

    unmount: () => {
      audio.fadeOut();
      instructions.reset();
      if (current) {
        current.unmount();
        current = null;
      }
    },
  }
);
