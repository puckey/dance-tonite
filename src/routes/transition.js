import viewer from '../viewer';
import props from '../props';
import settings from '../settings';
import hud from '../hud';
import * as THREE from '../lib/three';

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
        setTimeout(() => {
          audio.rewind();
        }, 4000);
      });
    }, 600);
  }
};

export default {
  hud: {
    menuEnter: toggleVR,
  },

  mount: () => {
    viewer.scene.add(props.grid);
    viewer.scene.fog = new THREE.Fog(0x000000, 0, 25);
  },

  unmount: () => {
    viewer.scene.remove(props.grid);
    viewer.scene.fog = false;
  },
};
