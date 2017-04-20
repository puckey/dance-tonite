import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import createTimeline from '../lib/timeline';
import about from '../about';

const { roomDepth, roomOffset, holeHeight } = settings;

const splashTitleDance = document.querySelector('.splash-title-dance');
const splashTitleLCD = document.querySelector('.splash-title-lcd');
const chromeExperiment = document.querySelector('.chrome-experiment');

const timeline = createTimeline([
  {
    time: 0.1,
    callback: () => {
      chromeExperiment.classList.remove('mod-hidden');
    },
  },
  {
    time: 0.3,
    callback: () => {
      splashTitleDance.classList.add('mod-hidden');
      splashTitleLCD.classList.remove('mod-hidden');
    },
  },
  {
    time: 0.8,
    callback: () => {
      chromeExperiment.classList.add('mod-hidden');
      splashTitleLCD.classList.add('mod-hidden');
    },
  },
]);


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
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, holeHeight, z);
      orb.move(z);
    };

    moveCamera(0);
    playlist = new Playlist({
      url: 'curated.json',
      pathRecording: req.params.id,
    }, () => {
      tick = () => {
        audio.tick();
        playlist.tick();
        timeline.tick(audio.progress);
        moveCamera(audio.progress);
      };

      // Audio plays after playlist is done loading:
      audio.load({
        src: audioSrc,
        loops: 16,
        progressive: true,
      }, (loadError) => {
        if (loadError) throw loadError;
        audio.play();
        viewer.events.on('tick', tick);
      });
    });
  },

  unmount: () => {
    audio.reset();
    viewer.events.off('tick', tick);
    orb.destroy();
    playlist.destroy();
  },
};
