import Orb from '../orb';
import audio from '../audio';
import audioSrc from '../public/sound/lcd-14loops.ogg';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import about from '../about';
import titles from '../titles';
import hud from '../hud';
import feature from '../utils/feature';
import sleep from '../utils/async';

const { roomDepth, roomOffset, holeHeight } = settings;
let progressBar;
const loopCount = 16;

const toggleVR = async () => {
  if (viewer.vrEffect.isPresenting) {
    hud.exitVR();
    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  } else {
    hud.enterVR();
    await audio.fadeOut();
    await viewer.vrEffect.requestPresent();
    viewer.switchCamera('default');
    await sleep(4000);
    audio.rewind();
  }
};

let orb;
let playlist;
let tick;

const hudSettings = {
  menuAdd: true,
  menuEnter: toggleVR,
  aboutButton: about.toggle,
  colophon: true,
};

let playClicked;
if (feature.isMobile) {
  playClicked = new Promise((resolve) => {
    hudSettings.playButton = function () {
      audio.fill();
      resolve();
    };
  });
} else {
  audio.fill();
}

export default {
  hud: hudSettings,

  mount: async (req) => {
    if (!progressBar) {
      progressBar = document.querySelector('.audio-progress-bar');
    }
    if (feature.isMobile) {
      await playClicked;
    }
    titles.mount();
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, holeHeight, z);
      orb.move(z);
    };

    moveCamera(0);

    playlist = new Playlist();
    playlist.load({
      url: 'curated.json',
      pathRecording: req.params.id,
    });
    tick = () => {
      audio.tick();
      playlist.tick();
      titles.tick();
      progressBar.style.transform = `scaleX(${audio.progress / loopCount})`;
      moveCamera(audio.progress);
    };

    await audio.load({
      src: audioSrc,
      loops: loopCount,
      progressive: true,
    });
    audio.play();
    hud.hideLoader();
    viewer.events.on('tick', tick);
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
