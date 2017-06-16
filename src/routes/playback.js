import Orb from '../orb';
import audio from '../audio';
import audioSrcOgg from '../public/sound/tonite.ogg';
import audioSrcMp3 from '../public/sound/tonite.mp3';
import Playlist from '../playlist';
import viewer from '../viewer';
import settings from '../settings';
import createTitles from '../titles';
import transition from '../transition';
import hud from '../hud';
import feature from '../utils/feature';
import { sleep } from '../utils/async';
import Room from '../room';
import progressBar from '../progress-bar';
import background from '../background';
import setupPOV from '../pov';
import layout from '../room/layout';

const { holeHeight } = settings;

// Chromium does not support mp3:
// TODO: Switch to always use MP3 in production.
const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;


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
    colophon: true,
  };

  if (process.env.FLAVOR === 'cms') {
    Object.assign(hudSettings, {
      playPauseButton: true,
      nextButton: true,
      prevButton: true,
      menuAdd: false,
    });
  }

  let orb;
  let playlist;
  let tick;
  const roomIndex = parseInt(req.params.roomIndex, 10);
  let pov;


  function move(progress) {
    const position = layout.getPosition(progress + 0.5);
    position.y += holeHeight;
    position.z *= -1;
    orb.position.copy(position);
    return position;
  }

  const component = {
    hud: hudSettings,
    mount: async () => {
      progressBar.create();
      Room.reset();
      if (!viewer.vrEffect.isPresenting) {
        viewer.switchCamera('orthographic');
      }

      orb = new Orb();
      titles = createTitles(orb);
      titles.mount();

      move(0);
      Room.rotate180();
      playlist = new Playlist();

      pov = setupPOV(orb, playlist);

      tick = () => {
        if (transition.isInside()) return;

        audio.tick();
        Room.clear();
        playlist.tick();
        titles.tick();
        background.tick();
        if (!feature.isMobile || !viewer.vrEffect.isPresenting) {
          progressBar.tick();
        }

        move(audio.progress || 0);
        pov.update(audio.progress);
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
        pathRecording: req.params.id,
        pathRoomIndex: roomIndex,
      }).then(() => {
        if (component.destroyed) return;
        pov.setupInput();
      });
      if (component.destroyed) return;

      hud.hideLoader();
      if (transition.isInside()) {
        transition.exit();
      }

      if (roomIndex) {
        // Start at 3 rooms before the recording, or 60 seconds before
        // the end of the track – whichever comes first.
        const watchTime = 30;
        const startTime = Math.min(
          (roomIndex - 2) * audio.loopDuration,
          audio.duration - watchTime
        );
        audio.gotoTime(startTime);
        if (viewer.vrEffect.isPresenting) {
          setTimeout(() => {
            if (component.destroyed) return;
            audio.fadeOut();
            transition.enter({
              text: 'Please take off your headset',
            });
            // TODO add share screen
          }, watchTime * 1000);
        }
      }

      // Safari won't play unless we wait until next tick
      setTimeout(() => {
        audio.play();
        audio.fadeIn();
      });
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
      background.destroy();
      pov.removeInput();
    },
  };
  return component;
};
<<<<<<< HEAD

//  duration / loopDuration causes the mega orb to be too far off-screen
//  move it back a ways so we can see it more immediately
const endPosMoveAhead = 0.86;

function positionMegaOrb( orb, audio ){
  const endPos = -( audio.duration * endPosMoveAhead / audio.loopDuration * roomDepth );
  orb.move(endPos);
}
=======
>>>>>>> master
