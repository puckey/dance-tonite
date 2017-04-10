import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';

let orb;
let playlist;
let tick;

export default {
  hud: {
    menuList: true,
  },

  mount: () => {
    viewer.switchCamera('ortographic');

    audio.load({
      src: audioSrc,
      loops: 16,
    }, (loadError) => {
      if (loadError) throw loadError;

      orb = new Orb();

      playlist = new Playlist('curated', () => {
        // Audio plays after playlist is done loading:
        audio.play();
      });

      const { roomDepth, roomOffset } = settings;
      tick = () => {
        audio.tick();
        playlist.tick();
        const z = ((audio.progress - 1.5) * roomDepth) + roomOffset;
        viewer.camera.position.z = z;
        orb.move(z);
      };

      viewer.events.on('tick', tick);
    });
  },

  unmount: () => {
    viewer.events.off('tick', tick);
    orb.destroy();
    playlist.destroy();
  },
};
