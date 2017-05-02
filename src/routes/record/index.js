import record from './record';
import review from './review';
import controllers from '../../controllers';
import instructions from '../../instructions';
import viewer from '../../viewer';
import router from '../../router';
import hud from '../../hud';

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

  mount: () => {
    controllers.add();
    controllers.update();
    const tick = async () => {
      if (viewer.vrEffect.isPresenting) {
        viewer.events.off('tick', tick);
        await hud.enterVR();
        goto('record');
      }
    };
    viewer.events.on('tick', tick);
  },

  unmount: () => {
    instructions.remove();
    if (unmountStep) {
      unmountStep();
      unmountStep = null;
    }
  },
};
