import dp from '../debugplane';
import viewer from '../viewer';
import Room from '../room';
import controllers from '../controllers';
import hud from '../hud';

const [leftController, rightController] = viewer.controllers;

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

  mount: async (req) => {

    viewer.scene.add( dp.group );

    controllers.add();
    controllers.update({
      right: {
        text: 'mark',
        removeOnPress: false
      },
      left: {
        text: 'clear',
        removeOnPress: false
      }
    });
    controllers.setButtonVisibility( 'left', false );
    controllers.setButtonVisibility( 'right', false );

    rightController.addEventListener('triggerdown', dp.mark );
    leftController.addEventListener('triggerdown', dp.reset );

    dp.load();
    dp.clear();
    dp.draw();
  },

  unmount: () => {
    viewer.scene.remove( dp.group );

    controllers.remove();

    rightController.removeEventListener('triggerdown', dp.mark );
  },
};

