import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-loop.ogg';
import viewer from '../viewer';
import { roomDepth, roomOffset } from '../settings';

let room;
let orb;
let tick;

export default {
  hud: {
    menuList: false,
  },

  mount: () => {
    viewer.camera.position.z = 0;
    viewer.switchCamera('default');
    room = new Room();
    orb = new Orb();

    audio.load({
      src: audioSrc,
      loops: 2,
    }, (loadError) => {
      if (loadError) throw loadError;
      audio.play();
    });

    tick = () => {
      audio.tick();
      const z = (audio.progress * roomDepth) + roomOffset;
      orb.move(z);
    };

    viewer.events.on('tick', tick);
  },

  unmount: () => {
    room.destroy();
    orb.destroy();
    viewer.events.off('tick', tick);
  },
};
