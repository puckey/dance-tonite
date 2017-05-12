import Orb from '../orb';
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

// Chromium does not support mp3:
// TODO: Switch to always use MP3 in production.
const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;
const { roomDepth, roomOffset, holeHeight } = settings;

let titles;

export default (req) => {
  const toggleVR = async () => {
    if (!feature.hasVR) return;
    if (viewer.vrEffect.isPresenting) {
      if (!feature.isIOVive) {
        viewer.vrEffect.exitPresent();
      }
      viewer.switchCamera('orthographic');
    } else {
      viewer.vrEffect.requestPresent();
      // #googleIO2017: in daydream, we don't show the vr overlay:
      if (feature.isIODaydream) {
        await audio.fadeOut();
        viewer.switchCamera('default');
      } else {
        const removeMessage = hud.enterVR();
        await audio.fadeOut();
        viewer.switchCamera('default');
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
    // #googleIO2017: hide add button
    menuAdd: !feature.isIO,
    // #googleIO2017: hide 'enter vr' button for vive stations:
    menuEnter: !feature.isIOVive && toggleVR,
    // #googleIO2017: hide about button
    aboutButton: !feature.isIO && about.toggle,
    // #googleIO2017: hide colophon element
    colophon: !feature.isIO,
    chromeExperiment: true,
  };

  let orb;
  let playlist;
  let tick;
  let progressBar;
  const loopIndex = parseInt(req.params.loopIndex, 10);

  const restartPlayback = () => {
    audio.rewind();
    audio.play();
  };

  const component = {
    hud: hudSettings,
    mount: async () => {
      Room.reset();

      progressBar = hud.create('div.audio-progress-bar');

      if (!viewer.vrEffect.isPresenting) {
        viewer.switchCamera('orthographic');
      }

      orb = new Orb();
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
        if (!feature.isIOVive) {
          titles.tick();
        }
        progressBar.style.transform = `scaleX(${audio.progress / settings.totalLoopCount})`;
        moveCamera(audio.progress);
      };

      hud.showLoader('Loading sound');

      await audio.load({
        src: audioSrc,
        loops: settings.totalLoopCount,
        // #googleIO2017: Don't loop on daydream and vive stations:
        loop: !(feature.isIODaydream || feature.isIOVive),
        progressive: true,
      });

      if (component.destroyed) return;

      hud.showLoader('Gathering user performances');
      await playlist.load({
        url: 'curated.json',
        pathRecording: req.params.id,
        loopIndex,
      });
      if (component.destroyed) return;

      hud.hideLoader();
      if (transition.isInside()) {
        transition.exit();
      }
      if (feature.isIOVive && loopIndex) {
        // Start at 3 rooms before the recording, or 60 seconds before
        // the end of the track – whichever comes first.
        const watchTime = 30;
        const startTime = Math.min(
          (loopIndex - 2) * audio.loopDuration,
          audio.duration - watchTime
        );
        audio.gotoTime(startTime);
        setTimeout(() => {
          if (component.destroyed) return;
          audio.fadeOut();
          transition.enter({
            text: 'Thanks for your performance! Please take off your headset.',
          });
        }, watchTime * 1000);
      }
      audio.fadeIn();
      audio.play();
      viewer.events.on('tick', tick);

      // #googleIO2017: On Daydream, have the controller's button:
      // - restart playback if not presenting
      // - if presenting, enter transition space that tells user to put hand up
      // - if in transition space, fades out again and starts playback
      if (feature.isIODaydream) {
        let daydreamState;
        const enterDaydreamTransition = (immediate) => {
          daydreamState = 'when-ready';
          titles.hide();
          return transition.enter({
            text: 'Put your hand up when you are ready',
            immediate,
          });
        };
        enterDaydreamTransition(true);
        viewer.daydreamController.on(
          'touchpaddown',
          async () => {
            if (!viewer.vrEffect.isPresenting) {
              restartPlayback();
              return;
            }
            audio.pause();
            if (daydreamState === 'when-ready') {
              daydreamState = 'playback';
              await transition.fadeOut();
              restartPlayback();
              transition.exit();
            } else if (/thank-you|playback/.test(daydreamState)) {
              if (daydreamState === 'playback') {
                await transition.exit();
              }
              enterDaydreamTransition();
            }
          }
        );
        audio.on('ended', () => {
          daydreamState = 'thank-you';
          audio.fadeOut();
          transition.enter({
            text: 'Please take off your headset.',
          });
        });
      }
    },

    unmount: () => {
      component.destroyed = true;
      if (viewer.vrEffect.isPresenting && !feature.isIOVive) {
        viewer.vrEffect.exitPresent();
      }
      audio.reset();
      viewer.events.off('tick', tick);
      orb.destroy();
      titles.destroy();
      playlist.destroy();
    },
  };
  return component;
};
