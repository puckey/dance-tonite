import record from './record';
import review from './review';
import tutorial from './tutorial';
import controllers from '../../controllers';
import instructions from '../../instructions';
import viewer from '../../viewer';
import router from '../../router';
import hud from '../../hud';

let unmountStep;

const components = {
  record,
  review,
  tutorial,
  start: (goto) => {
    controllers.add();
    const tick = async () => {
      if (viewer.vrEffect.isPresenting) {
        await hud.enterVR();
        goto('tutorial');
        viewer.events.off('tick', tick);
      }
    };
    viewer.events.on('tick', tick);
    return () => { };
  },
};

export default {
  hud: {
    menuEnter: viewer.vrEffect.isPresenting
      ? false
      : function () {
        this.classList.toggle('mod-hidden');
        viewer.vrEffect.requestPresent().then(() => {
          viewer.switchCamera('default');
        });
      },
  },

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
    goto('start');
  },

  unmount: () => {
    instructions.remove();
    if (unmountStep) {
      unmountStep();
      unmountStep = null;
    }
  },
};
