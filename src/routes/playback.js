import Orb from '../orb';
import audio from '../audio';
import audioPool from '../utils/audio-pool';
import audioSrcOgg from '../public/sound/tonite.ogg';
import audioSrcMp3 from '../public/sound/tonite.mp3';
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
import props from '../props';

// Chromium does not support mp3:
// TODO: Switch to always use MP3 in production.
const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;
const { roomDepth, roomOffset, holeHeight } = settings;

const toggleVR = async () => {
  if (!feature.hasVR) return;
  if (viewer.vrEffect.isPresenting) {
    viewer.vrEffect.exitPresent();
    viewer.switchCamera('orthographic');
  } else {
    viewer.vrEffect.requestPresent();
    const removeMessage = hud.enterVR();
    await audio.fadeOut();
    viewer.switchCamera('default');
    if (queryData.demo) {
      transition.enter({
        text: 'Let us know when you\'re ready',
      });
      // TODO listen for daydream button press
      // await daydreamButtonPressed;
    } else {
      await sleep(1000);
      audio.pause();
      audio.rewind();
      await sleep(4000);
      removeMessage();
    }

    audio.play();
  }
};

const hudSettings = {
  menuAdd: true,
  menuEnter: toggleVR,
  aboutButton: about.toggle,
  colophon: true,
  chromeExperiment: true,
};

let orb;
let playlist;
let tick;
let progressBar;
let playClicked;
let audioElement;

if (feature.isMobile) {
  playClicked = new Promise((resolve) => {
    hud.create('div.play-button', {
      onclick: () => {
        this.classList.add('mod-hidden');
        audioPool.fill();
        audioElement = audioPool.get();
        resolve();
      },
    }, 'Press to start');
  });
}

export default {
  hud: hudSettings,

  mount: async (req) => {
    progressBar = hud.create('div.audio-progress-bar');

    if (feature.isMobile) {
      await playClicked;
    }
    titles.mount();
    viewer.switchCamera('orthographic');
    orb = new Orb();

    const moveCamera = (progress) => {
      const emptySpace = 2.5;
      const z = ((progress - emptySpace) * roomDepth) + roomOffset;
      viewer.camera.position.set(0, holeHeight, -z);
      orb.move(-z);
    };

    moveCamera(0);
    Room.rotate180();
    playlist = new Playlist();

    tick = () => {
      audio.tick();
      playlist.tick();
      titles.tick();
      progressBar.style.transform = `scaleX(${audio.progress / settings.totalLoopCount})`;
      moveCamera(audio.progress);
    };


    await Promise.all([
      playlist.load({
        url: 'curated.json',
        pathRecording: req.params.id,
        loopIndex: parseInt(req.params.loopIndex, 10),
      }),
      audio.load({
        audioElement,
        src: audioSrc,
        loops: settings.totalLoopCount,
        progressive: true,
      }),
    ]);
    hud.hideLoader();
    audio.play();
    viewer.events.on('tick', tick);
  },

  unmount: () => {
    audio.reset();
    viewer.events.off('tick', tick);
    orb.destroy();
    titles.destroy();
    playlist.destroy();
  },
};
