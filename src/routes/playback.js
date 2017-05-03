import Orb from '../orb';
import audio from '../audio';
import audioPool from '../utils/audio-pool';
import audioSrcOgg from '../public/sound/lcd-14loops.ogg';
import audioSrcMp3 from '../public/sound/lcd-14loops.mp3';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import about from '../about';
import titles from '../titles';
import transition from '../transition';
import hud from '../hud';
import feature from '../utils/feature';
import { sleep } from '../utils/async';
import Room from '../room';
import { queryData } from '../utils/url';

const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;
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
    // TODO: figure out if we can build in a timeout before entering vr:
    viewer.vrEffect.requestPresent();
    await audio.fadeOut();
    viewer.switchCamera('default');

    if (queryData.demo) {
      transition.enter({
        text: 'Let us know when you\'re ready',
      });
      // TODO listen for daydream button press
      // await daydreamButtonPressed;
    } else {
      await sleep(5000);
    }

    audio.rewind();
    audio.play();
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
let audioElement;
if (feature.isMobile) {
  playClicked = new Promise((resolve) => {
    hudSettings.playButton = function () {
      this.classList.add('mod-hidden');
      audioPool.fill();
      audioElement = audioPool.get();
      resolve();
    };
  });
}

export default {
  hud: hudSettings,

  mount: async (req) => {
    if (!progressBar) {
      progressBar = document.querySelector('.audio-progress-bar');
    }
    progressBar.style.width = '100vw';

    if (feature.isMobile) {
      await playClicked;
    }
    titles.mount();
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const z = ((progress - 1.5) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, holeHeight, -z);
      orb.move(-z);
    };

    moveCamera(0);

    Room.rotate180();
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
      audioElement,
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
