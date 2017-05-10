import h from 'hyperscript';
import router from '../../router';
import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import hud from '../../hud';
import createTimeline from '../../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../../theme/colors';
import { Vector3 } from '../../lib/three';
import feature from '../../utils/feature';
import { sleep } from '../../utils/async';
import controllers from '../../controllers';

// TODO: replace with better recording:
const TUTORIAL_RECORDING_URL = '1030266141029-b5ba6ff6.json';

const { roomDepth, roomOffset } = settings;

const getLineTransform = (x1, y1, x2, y2, margin) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default (goto) => {
  let getLineTarget;
  let room;
  const state = { minLayers: 0 };
  const elements = {};
  const objects = {};

  const TEMP_VECTOR = new Vector3();
  const worldToScreen = (position) => {
    // map to normalized device coordinate (NDC) space
    TEMP_VECTOR
      .copy(position)
      .project(viewer.camera);
    TEMP_VECTOR.x = (TEMP_VECTOR.x + 1) * (state.windowWidth * 0.5);
    TEMP_VECTOR.y = (-TEMP_VECTOR.y + 1) * (state.windowHeight * 0.5);

    return TEMP_VECTOR;
  };

  const performSkip = async () => {
    // TODO: we need to make sure the user has a vr device capable of room vr:
    if (feature.hasVR) {
      elements.skipTutorialButton.classList.add('mod-hidden');
      const removeOverlay = hud.enterVR();
      await viewer.vrEffect.requestPresent();
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
        room.changeColor(recordRoomColor);
      },
    },
  ]);

  const createOverlay = () => {
    if (elements.overlayEl) return;
    elements.overlayEl = hud.create(
      'div.tutorial-overlay',
      {
        onclick: performSkip,
      },
      h(
        'div.tutorial-overlay-text',
        h(
          'span',
          feature.hasVR
            ? 'Add your performance'
            : 'A message about Vive not being found. Click here to go home.'
        ),
      )
    );
  };

  // #googleIO2017: long press trigger button to display 'Add your performance' button:
  if (feature.isIOVive) {
    controllers.on('triggerlongpress', createOverlay);
  }

  const textTimeline = createTimeline([
    {
      time: 0.5,
      text: 'This is you.',
      getPosition: () => room.getHeadPosition(0, audio.time),
    },
    {
      time: 3,
      text: 'This is the camera.',
      getPosition: () => objects.orb.mesh.position,
    },
    {
      time: 8,
      text: 'Dance!',
    },
    {
      time: 14,
      getPosition: () => room.getHeadPosition(0, audio.time),
      text: 'This is you...',
    },
    {
      time: 16,
      getPosition: () => room.getHeadPosition(1, audio.time),
      text: 'This is you...',
    },
    {
      time: 17,
      text: 'This is your previous recording.',
      getPosition: () => room.getHeadPosition(0, audio.time),
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
      time: 37.5,
      text: '',
      callback: createOverlay,
    },
  ]);

  const tick = () => {
    audio.tick();
    room.gotoTime(
      audio.time,
      Math.max(
        state.minLayers,
        Math.ceil(audio.totalProgress / 2)
      )
    );
    const progress = audio.progress - 1; // value between -1 and 1
    colorTimeline.tick(audio.progress);
    textTimeline.tick(audio.currentTime);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    objects.orb.move(z);
    if (audio.totalProgress > 1) {
      objects.orb2.move(z - roomDepth * 2);
    }

    if (getLineTarget) {
      const { x, y } = worldToScreen(getLineTarget());
      elements.lineEl.style.transform = getLineTransform(
        state.lineOriginX,
        state.lineOriginY,
        x,
        y,
        state.windowHeight * 0.03
      );
    }
  };

  const updateWindowDimensions = () => {
    state.windowWidth = window.innerWidth;
    state.windowHeight = window.innerHeight;
    state.lineOriginX = state.windowWidth / 2;
    state.lineOriginY = elements.tutorialText.offsetHeight * 1.2;
  };

  const handleKeyframe = ({ text, getPosition, layers }) => {
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      elements.tutorialText.innerHTML = text;
    }
    getLineTarget = getPosition;
    elements.lineEl.style.opacity = getPosition ? 1 : 0;
    if (layers) {
      state.minLayers = layers;
    }
  };

  const component = {
    mount: async () => {
      Room.reset();
      hud.showLoader();
      objects.orb = new Orb();
      objects.orb2 = new Orb();

      elements.tutorialText = hud.create('div.tutorial-text');
      elements.skipTutorialButton = hud.create(
        'div.skip-tutorial-button',
        {
          onclick: createOverlay,
        },
        // #googleIO2017: we display 'Tutorial' in the bottom right so people
        // understand what they're watching.
        feature.isIOVive ? 'Dance Tonite Tutorial' : 'Skip Tutorial'
      );
      if (!feature.isIOVive) {
        hud.create('div.close-button',
          {
            onclick: () => router.navigate('/'),
          },
          '×'
        );
      }
      elements.lineEl = hud.create('div.line', {
        style: {
          transform: 'scaleX(0)',
        },
      });

      viewer.switchCamera('orthographic');
      state.originalCameraPosition = viewer.camera.position.clone();
      state.originalZoom = viewer.camera.zoom;
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.zoom = 0.7;
      viewer.camera.updateProjectionMatrix();

      Room.rotate180();

      await Promise.all([
        audio.load({
          src: '/public/sound/room-1.ogg',
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
      window.addEventListener('resize', updateWindowDimensions);
      updateWindowDimensions();
    },
    unmount: () => {
      component.destroyed = true;
      objects.orb.destroy();
      objects.orb2.destroy();
      viewer.camera.position.copy(state.originalCameraPosition);
      viewer.camera.zoom = state.originalZoom;
      viewer.camera.updateProjectionMatrix();
      window.removeEventListener('resize', updateWindowDimensions);
      audio.reset();
      audio.fadeOut();
      if (room) {
        room.destroy();
      }
      viewer.camera.position.y = 0;
      viewer.camera.zoom = 1;
      viewer.camera.updateProjectionMatrix();
      viewer.events.off('tick', tick);
      textTimeline.off('keyframe', handleKeyframe);
      // #googleIO2017: remove event listener which was added above:
      if (feature.isIOVive) {
        controllers.off('triggerlongpress', createOverlay);
      }
    },
  };

  return component;
};
