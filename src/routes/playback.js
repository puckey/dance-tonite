import Orb from '../orb';
import MegaOrb from '../megaorb';
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
import layout from '../room/layout';
import closestHead from '../utils/closestHead';

// Chromium does not support mp3:
// TODO: Switch to always use MP3 in production.
const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;
const { holeHeight } = settings;
let pointerX;
let pointerY;
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

  let CMSPlaybackControls;

  if (process.env.FLAVOR === 'cms') {
    CMSPlaybackControls = {
      playPauseButton: true,
      nextButton: true,
      prevButton: true,
      menuAdd: false,
    };
  }

  const hudSettings = {
    menuAdd: true,
    menuEnter: toggleVR,
    colophon: true,
    ...CMSPlaybackControls,
  };

  let orb;
  let megaOrb;
  let playlist;
  let tick;
  const roomIndex = parseInt(req.params.roomIndex, 10);

  let onMouseMove;
  let onMouseDown;
  let onMouseUp;
  let hoverHead;

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

      const moveHead = (progress) => {
        moveCamera(progress);
        const [roomIndex, headIndex] = hoverHead;
        playlist.rooms[roomIndex].transformToHead(viewer.camera, headIndex);
      };

      const moveCamera = (progress) => {
        const position = layout.getPosition(progress + 0.5);
        position.y += holeHeight;
        position.z *= -1;
        viewer.camera.position.copy(position);
        orb.position.copy(position);
        megaOrb.setProgress(audio.time / audio.duration);
      };

      moveCamera(0);
      Room.rotate180();
      playlist = new Playlist();

      tick = () => {
        if (transition.isInside()) return;
        if (!viewer.vrEffect.isPresenting && !hoverHead) {
          Room.setHighlight(
            closestHead(
              pointerX,
              pointerY,
              playlist.rooms
            )
          );
        }
        audio.tick();
        Room.clear();
        playlist.tick();
        titles.tick();
        if (!feature.isMobile || !viewer.vrEffect.isPresenting) {
          progressBar.tick();
        }
        if (hoverHead) {
          moveHead(audio.progress || 0);
        } else {
          moveCamera(audio.progress || 0);
        }
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
        pathRoomIndex: roomIndex,
      }).then(() => {
        if (component.destroyed) return;
        onMouseMove = ({ clientX, clientY }) => {
          if (viewer.vrEffect.isPresenting) return;
          pointerX = clientX;
          pointerY = clientY;
        };

        onMouseDown = ({ clientX, clientY, touches }) => {
          let x = clientX;
          let y = clientY;
          if (touches && touches.length > 0) {
            x = touches[0].pageX;
            y = touches[0].pageY;
          }
          if (viewer.vrEffect.isPresenting) return;
          hoverHead = closestHead(x, y, playlist.rooms);
          if (hoverHead[0] === undefined) hoverHead = null;
          if (hoverHead) {
            viewer.switchCamera('default');
            Room.group.add(viewer.camera);
          }
        };

        onMouseUp = () => {
          if (viewer.vrEffect.isPresenting) return;
          hoverHead = null;
          viewer.switchCamera('orthographic');
          Room.group.remove(viewer.camera);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('touchstart', onMouseDown, false);
        window.addEventListener('touchend', onMouseUp, false);
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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    },
  };
  return component;
};
