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
const { roomDepth, holeHeight } = settings;
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

  const hudSettings = {
    menuAdd: true,
    menuEnter: toggleVR,
    colophon: true,
  };

  let orb;
  let megaOrb;
  let playlist;
  let tick;
  const loopIndex = parseInt(req.params.loopIndex, 10);

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
        viewer.camera.fov = 90;
        viewer.camera.updateProjectionMatrix();
      };

      const moveCamera = (progress) => {
        const position = layout.getPosition(progress + 0.5);
        position.y += holeHeight;
        position.z *= -1;
        viewer.camera.position.copy(position);
        orb.position.copy(position);
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
        loopIndex,
      }).then(() => {
        if (component.destroyed) return;
        onMouseMove = ({ clientX, clientY }) => {
          pointerX = clientX;
          pointerY = clientY;
        };

        onMouseDown = ({ clientX, clientY }) => {
          hoverHead = closestHead(clientX, clientY, playlist.rooms);
          if (hoverHead[0] === undefined) hoverHead = null;
          if (hoverHead) {
            viewer.switchCamera('default');
            Room.group.add(viewer.camera);
          }
        };

        onMouseUp = () => {
          hoverHead = null;
          viewer.switchCamera('orthographic');
          Room.group.remove(viewer.camera);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
      });
      if (component.destroyed) return;

      hud.hideLoader();
      if (transition.isInside()) {
        transition.exit();
      }

      if (loopIndex) {
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
            text: 'Please take off your headset',
          });
          // TODO add share screen
        }, watchTime * 1000);
      }

      audio.fadeIn();
      audio.play();

      positionMegaOrb(megaOrb);
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

//  duration / loopDuration causes the mega orb to be too far off-screen
//  move it back a ways so we can see it more immediately
const endPosMoveAhead = 0.86;

const positionMegaOrb = (orb) => {
  orb.position.z = -(audio.duration * endPosMoveAhead / audio.loopDuration * roomDepth);
};


window.audio = audio;
