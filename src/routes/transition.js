import Orb from '../orb';
import viewer from '../viewer';
import props from '../props';
import hud from '../hud';
import * as THREE from '../lib/three';
import * as SDFText from '../sdftext';
import { offsetFrom } from '../utils/three';

const textCreator = SDFText.creator();
const text = textCreator.create('', {
  wrapWidth: 2000,
  scale: 15,
  align: 'center',
  color: 0xffff07,
});

const toggleVR = () => {
  if (viewer.vrEffect.isPresenting) {
    hud.exitVR();
    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  } else {
    hud.enterVR();
    setTimeout(() => {
      viewer.vrEffect.requestPresent().then(() => {
        viewer.switchCamera('default');
      });
    }, 600);
  }
};

let floatingOrb;
let ticks = 0;

// floating animation
const tick = dt => {
  ticks += dt;
  if (!floatingOrb) return;
  floatingOrb.mesh.position.y = Math.sin(ticks * 2) / 4 + 2;
};

export default {
  hud: {
    menuEnter: toggleVR,
  },

  mount: () => {
    // wait for next tick to update camera rotation because reasons
    setTimeout(() => {
      text.updateLabel('Please take off your headset');
      text.position.copy(offsetFrom(viewer.camera, -5, 2, -10));
      text.lookAt(viewer.camera.position);
      viewer.scene.add(text);

      floatingOrb = new Orb();
      floatingOrb.mesh.position.copy(offsetFrom(viewer.camera, 2, 0, -8));
      floatingOrb.mesh.scale.set(4, 4, 4);
      floatingOrb.fadeIn();
    }, 0);

    viewer.scene.add(props.grid);
    viewer.events.on('tick', tick);

    setTimeout(viewer.fadeToBlack, 4000);
  },

  unmount: () => {
    floatingOrb.destroy();
    viewer.scene.remove(props.grid);
    viewer.scene.remove(text);
    viewer.scene.fog = false;
    viewer.events.off('tick', tick);
  },
};
