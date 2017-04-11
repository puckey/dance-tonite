import Room from '../room';
import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-loop.ogg';
import viewer from '../viewer';
import settings from '../settings';
import Recording from '../recording';

const { roomDepth, roomOffset } = settings;

let room;
let orb;
let tick;
let recording;

export default {
  hud: { },

  mount: () => {
    viewer.camera.position.z = 0;
    viewer.switchCamera('default');
    recording = new Recording();
    room = new Room({ recording });
    orb = new Orb();

    audio.load({
      src: audioSrc,
      loops: 2,
    }, (loadError) => {
      if (loadError) throw loadError;
      audio.play();
      viewer.events.on('tick', tick);
    });

    tick = () => {
      audio.tick();
      room.gotoTime(audio.time);
      // TODO: fix coordinates
      const z = ((audio.progress - 1) * roomDepth) + roomOffset;
      orb.move(z);
      recording.tick();
    };
  },

  unmount: () => {
    room.destroy();
    orb.destroy();
    viewer.events.off('tick', tick);
  },
};
