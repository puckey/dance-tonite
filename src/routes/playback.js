import Orb from '../orb';
import MegaOrb from '../megaorb';
import audio from '../audio';
import audioSrcOgg from '../public/sound/tonite.ogg';
import audioSrcMp3 from '../public/sound/tonite.mp3';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import about from '../about';
import createTitles from '../titles';
import transition from '../transition';
import hud from '../hud';
import feature from '../utils/feature';
import { sleep } from '../utils/async';
import Room from '../room';
import progressBar from '../progress-bar';

// Chromium does not support mp3:
// TODO: Switch to always use MP3 in production.
const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;
const { roomDepth, roomOffset, holeHeight } = settings;

let titles;

export default (req) => {
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
      await sleep(1000);
      audio.pause();
      audio.rewind();
      await sleep(4000);
      removeMessage();
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
  let megaOrb;
  let playlist;
  let tick;
  const loopIndex = parseInt(req.params.loopIndex, 10);

  const component = {
    hud: hudSettings,
    mount: async () => {
      progressBar.create();
      Room.reset();
      if (!viewer.vrEffect.isPresenting) {
        viewer.switchCamera('orthographic');
      }

      orb = new Orb();
      megaOrb = new MegaOrb();
      titles = createTitles(orb);
      titles.mount();

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
        if (transition.isInside()) return;
        audio.tick();
        Room.clear();
        playlist.tick();
        titles.tick();
        progressBar.tick();
        moveCamera(audio.progress);
      };
      viewer.events.on('tick', tick);

      hud.showLoader('Loading sound');

      await audio.load({
        src: audioSrc,
        loops: settings.totalLoopCount,
        loop: true,
        progressive: true,
      });

      if (component.destroyed) return;

      hud.showLoader('Gathering user performances');

      playlist.load({
        url: 'curated.json',
        pathRecording: req.params.id,
        loopIndex,
      });
      if (component.destroyed) return;

      hud.hideLoader();
      if (transition.isInside()) {
        transition.exit();
      }
      audio.fadeIn();
      audio.play();

      positionMegaOrb( megaOrb, audio );
    },

    unmount: () => {
      component.destroyed = true;
      if (viewer.vrEffect.isPresenting) {
        viewer.vrEffect.exitPresent();
      }
      viewer.events.off('tick', tick);
      orb.destroy();
      titles.destroy();
      playlist.destroy();
      progressBar.destroy();
    },
  };
  return component;
};

//  duration / loopDuration causes the mega orb to be too far off-screen
//  move it back a ways so we can see it more immediately
const endPosMoveAhead = 0.86;

function positionMegaOrb( orb, audio ){
  const endPos = -( audio.duration * endPosMoveAhead / audio.loopDuration * roomDepth );
  orb.move(endPos);
}
