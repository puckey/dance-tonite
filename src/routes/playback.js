import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import about from '../about';
import titles from '../titles';
import hud from '../hud';

const { roomDepth, roomOffset, holeHeight } = settings;
const progressBar = document.querySelector('.audio-progress-bar');
const loopCount = 16;

let orb;
let playlist;
let tick;

export default {
  hud: {
    menuAdd: true,
    menuEnter: viewer.toggleVR,
    aboutButton: about.toggle,
  },

  mount: (req) => {
    titles.mount();
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, holeHeight, z);
      orb.move(z);
    };

    moveCamera(0);

    hud.showLoader('Loading performances...');
    playlist = new Playlist({
      url: 'curated.json',
      pathRecording: req.params.id,
    }, () => {
      tick = () => {
        audio.tick();
        playlist.tick();
        titles.tick();
        progressBar.style.width = (100 * audio.progress) / loopCount + '%';
        moveCamera(audio.progress);
      };

      // Audio plays after playlist is done loading:
      hud.showLoader('Spinning up the track...');
      audio.load({
        src: audioSrc,
        loops: loopCount,
        progressive: true,
      }, (loadError) => {
        if (loadError) throw loadError;
        hud.hideLoader();
        audio.play();
        viewer.events.on('tick', tick);
      });
    });
  },

  unmount: () => {
    progressBar.style.width = 0;
    audio.reset();
    viewer.events.off('tick', tick);
    orb.destroy();
    titles.destroy();
    playlist.destroy();
  },
};
