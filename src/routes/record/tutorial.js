import h from 'hyperscript';
import router from '../../router';
import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import hud from '../../hud';
import createTimeline from '../../lib/timeline';
import { waitRoomColor, getRoomColor } from '../../theme/colors';
import feature from '../../utils/feature';
import { sleep } from '../../utils/async';
import windowSize from '../../utils/windowSize';
import audioSrcOgg from '../../public/sound/room-1.ogg';
import audioSrcMp3 from '../../public/sound/room-1.mp3';
import { worldToScreen } from '../../utils/three';

const audioSrc = feature.isChrome ? audioSrcOgg : audioSrcMp3;

// TODO: replace with better recording:
const TUTORIAL_RECORDING_URL = 'hIR_Tw';

const { roomDepth, roomOffset } = settings;

const getLineTransform = (x1, y1, x2, y2, margin) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default (goto, req) => {
  let getLineTarget;
  let room;
  const roomColor = getRoomColor(parseInt(req.params.roomIndex, 10));
  const state = { minLayers: 0 };
  const elements = {};
  const objects = {};

  const performSkip = async () => {
    if (feature.has6DOF) {
      elements.skipTutorialButton.classList.add('mod-hidden');
      const removeOverlay = hud.enterVR();
      if (!viewer.vrEffect.isPresenting) {
        await viewer.vrEffect.requestPresent();
      }
      // Wait for the VR overlay to cover the screen:
      await sleep(500);
      goto('record');
      await sleep(4500);
      removeOverlay();
    } else {
      goto('/');
    }
  };

  const colorTimeline = createTimeline([
    {
      time: 0,
      callback: () => {
        room.changeColor(waitRoomColor);
        objects.orb2.fadeOut();
        objects.orb.fadeIn();
      },
    },
    {
      time: 1,
      callback: () => {
        room.changeColor(roomColor);
      },
    },
  ]);

  const createOverlay = () => {
    if (elements.overlayEl) return;
    elements.overlayEl = feature.has6DOF ? hud.create(
      'div.tutorial-overlay',
      h('div.tutorial-overlay-text', h('a', { onclick: performSkip }, 'Add your performance')),
    ) :
    hud.create(
      'div.tutorial-overlay',
      h(
        'div.tutorial-overlay-text',
        h(
          'span',
          h('h3', 'Shucks, room-scale VR not found.'),
          h('p', 'This requires room-scale VR and a WebVR-enabled browser.'),
          h('a', { href: 'https://webvr.info', target: '_blank' }, 'Get set up'),
          ' or ',
          h('a', { onclick: performSkip }, 'return home.')
        )
      ),
    );
  };

  const textTimeline = createTimeline([
    {
      time: 0.5,
      text: 'This is you.',
      getPosition: () => room.getHeadPosition(0),
      layers: 1,
    },
    {
      time: 5,
      text: 'This is the camera.',
      getPosition: () => objects.orb.mesh.position,
    },
    {
      time: 8,
      text: 'Dance!',
    },
    {
      time: 10.5,
      text: '(Try to avoid bumping into the camera)',
      getPosition: null,
    },
    {
      time: 13.5,
      text: '',
      getPosition: null,
    },
    {
      time: 14,
      getPosition: () => room.getHeadPosition(0),
      text: 'This is you...',
    },
    {
      time: 16,
      getPosition: () => room.getHeadPosition(1),
      text: 'This is you...',
    },
    {
      time: 17,
      text: 'This is your previous recording.',
      getPosition: () => room.getHeadPosition(0),
    },
    {
      time: 24,
      text: 'Dance together!',
    },
    {
      time: 32,
      text: 'Add up to 10 copies of yourself.',
      layers: 3,
    },
    {
      time: 33,
      text: 'Add up to 10 copies of yourself.',
      layers: 4,
    },
    {
      time: 34,
      text: 'Add up to 10 copies of yourself.',
      layers: 5,
    },
    {
      time: 38,
      text: '',
      callback: createOverlay,
    },
  ]);

  const tick = () => {
    audio.tick();
    Room.clear();
    room.gotoTime(
      audio.time,
      Math.max(
        state.minLayers,
        Math.ceil((audio.totalProgress / 2) % 3)
      )
    );
    const progress = audio.progress - 1; // value between -1 and 1
    colorTimeline.tick(audio.progress);
    textTimeline.tick(audio.time % 48);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    objects.orb.position.z = z;
    if (audio.totalProgress > 1) {
      objects.orb2.position.z = z - roomDepth * 2;
    }

    if (getLineTarget) {
      const { x, y } = worldToScreen(viewer.camera, getLineTarget());
      elements.lineEl.style.transform = getLineTransform(
        state.lineOriginX,
        state.lineOriginY,
        x,
        y,
        windowSize.height * 0.04
      );
    }
  };

  const updateWindowDimensions = ({ width }) => {
    state.lineOriginX = width / 2;
    state.lineOriginY = elements.tutorialText.offsetHeight * 1.2;
  };

  const handleKeyframe = ({ text, getPosition, layers }) => {
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      elements.tutorialText.innerHTML = text;
    }
    getLineTarget = getPosition;
    elements.lineEl.style.opacity = getPosition ? 1 : 0;
    if (layers !== undefined) {
      state.minLayers = layers;
    }
  };

  const component = {
    mount: async () => {
      Room.reset();
      hud.showLoader();
      objects.orb = new Orb();
      objects.orb2 = new Orb();

      elements.tutorialText = hud.create('div.tutorial-text.mod-removed');
      elements.skipTutorialButton = hud.create(
        'div.skip-button',
        {
          onclick: createOverlay,
        },
        'Skip Tutorial'
      );
      hud.create('div.close-button',
        {
          onclick: () => router.navigate('/'),
        },
        '×'
      );
      elements.lineEl = hud.create('div.tutorial-line', {
        style: {
          transform: 'scaleX(0)',
        },
      });

      viewer.switchCamera('orthographic');
      state.originalCameraPosition = viewer.camera.position.clone();
      state.originalZoom = viewer.camera.zoom;
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.updateProjectionMatrix();

      Room.rotate180();

      await Promise.all([
        audio.load({
          src: audioSrc,
          loops: 2,
          loopOffset: 0.5,
        }),
        sleep(1000),
      ]);
      if (component.destroyed) return;

      hud.hideLoader();

      room = new Room({
        url: TUTORIAL_RECORDING_URL,
        showHead: true,
        index: 0,
        recording: true,
      });
      room.changeColor(waitRoomColor);

      await sleep(2000);
      if (component.destroyed) return;
      room.load();

      audio.play();
      audio.mute();
      audio.fadeIn();

      textTimeline.on('keyframe', handleKeyframe);
      viewer.events.on('tick', tick);
      windowSize.on('resize', updateWindowDimensions);
      updateWindowDimensions(windowSize);
    },
    unmount: () => {
      component.destroyed = true;
      objects.orb.destroy();
      objects.orb2.destroy();
      viewer.camera.position.copy(state.originalCameraPosition);
      viewer.camera.zoom = state.originalZoom;
      viewer.camera.updateProjectionMatrix();
      windowSize.off('resize', updateWindowDimensions);
      audio.reset();
      audio.fadeOut();
      if (room) {
        room.destroy();
      }
      viewer.camera.position.y = 0;
      viewer.camera.updateProjectionMatrix();
      viewer.events.off('tick', tick);
      textTimeline.off('keyframe', handleKeyframe);
    },
  };

  return component;
};
