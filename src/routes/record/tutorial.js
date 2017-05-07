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

// TODO: replace with better recording:
const TUTORIAL_RECORDING_URL = '1030619465488-e65b1335.json?dance';

const { roomDepth, roomOffset } = settings;

const getLineTransform = (x1, y1, x2, y2, margin) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)) - margin;
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

export default async (goto) => {
  hud.showLoader();
  let windowWidth;
  let windowHeight;
  let lineOriginX;
  let lineOriginY;
  let getLineTarget;
  let minLayers = 0;
  let overlayAdded = false;

  const TEMP_VECTOR = new Vector3();
  const worldToScreen = (position) => {
    // map to normalized device coordinate (NDC) space
    TEMP_VECTOR
      .copy(position)
      .project(viewer.camera);
    TEMP_VECTOR.x = (TEMP_VECTOR.x + 1) * (windowWidth * 0.5);
    TEMP_VECTOR.y = (-TEMP_VECTOR.y + 1) * (windowHeight * 0.5);

    return TEMP_VECTOR;
  };

  const orb = new Orb();
  const orb2 = new Orb();

  const tutorialText = hud.create('div.tutorial-text', '');
  const skipTutorialButton = hud.create(
    'div.skip-tutorial-button',
    {
      onclick: () => {
        hud.create(
          'div.tutorial-overlay.mod-link',
          {
            onclick: performSkip,
          },
          hud.h(
            'div.tutorial-overlay-text',
            'Click here to add your performance!'
          )
        );
        overlayAdded = true;
      },
    },
    'Skip Tutorial'
  );
  hud.create('div.close-button',
    {
      onclick: () => router.navigate('/'),
    },
    '×'
  );
  const lineEl = hud.create('div.line', {
    style: {
      transform: 'scaleX(0)',
    },
  });

  skipTutorialButton.classList.remove('mod-hidden');

  await audio.load({
    src: '/public/sound/room-1.ogg',
    loops: 2,
    loopOffset: 0.5,
  });

  viewer.switchCamera('orthographic');
  const originalCameraPosition = viewer.camera.position.clone();
  const originalZoom = viewer.camera.zoom;
  viewer.camera.position.y = 2;
  viewer.camera.position.z = 1.3;
  viewer.camera.zoom = 0.7;
  viewer.camera.updateProjectionMatrix();

  const room = new Room({
    url: TUTORIAL_RECORDING_URL,
    showHead: true,
    index: 1,
  });

  room.changeColor(waitRoomColor);
  room.load();
  Room.rotate180();

  audio.play();
  audio.mute();
  audio.fadeIn();

  const performSkip = async () => {
    // TODO: we need to make sure the user has a vr device capable of room vr:
    if (feature.hasVR) {
      viewer.vrEffect.requestPresent();
      skipTutorialButton.classList.add('mod-hidden');
      await hud.enterVR();
      goto('record');
    } else {
      hud.create(
        'div.tutorial-overlay.mod-hidden',
        {
          onclick: () => goto('/'),
        },
        hud.h(
          'div.tutorial-overlay-text.mod-link',
          'A message about Vive not being found. Click here to go back.'
        )
      );
    }
  };

  const colorTimeline = createTimeline([
    {
      time: 0,
      callback: () => {
        room.changeColor(waitRoomColor);
        orb2.fadeOut();
        orb.fadeIn();
      },
    },
    {
      time: 1,
      callback: () => {
        room.changeColor(recordRoomColor);
      },
    },
  ]);

  const textTimeline = createTimeline([
    {
      time: 0.5,
      text: 'This is you.',
      getPosition: () => room.getHeadPosition(0, audio.time),
    },
    {
      time: 3,
      text: 'This is the camera.',
      getPosition: () => orb.mesh.position,
    },
    {
      time: 8,
      text: 'Dance for the camera!',
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
      time: 28,
      text: 'Add up to 10 copies of yourself.',
      layers: 5,
    },
    {
      time: 32,
      text: '',
    },
    {
      time: 37.5,
      callback: () => {
        if (overlayAdded) return;
        hud.create(
          'div.tutorial-overlay.mod-hidden.mod-link',
          {
            onclick: performSkip,
          },
          h(
            'div.tutorial-overlay-text',
            'Click here to add your performance!'
          )
        );
      },
    },
  ]);

  const tick = () => {
    audio.tick();
    room.gotoTime(
      audio.time,
      Math.max(
        minLayers,
        Math.ceil(audio.totalProgress / 2)
      )
    );
    const progress = audio.progress - 1; // value between -1 and 1
    colorTimeline.tick(audio.progress);
    textTimeline.tick(audio.currentTime);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    orb.move(z);
    if (audio.totalProgress > 1) {
      orb2.move(z - roomDepth * 2);
    }

    if (getLineTarget) {
      const { x, y } = worldToScreen(getLineTarget());
      lineEl.style.transform = getLineTransform(
        lineOriginX,
        lineOriginY,
        x,
        y,
        windowHeight * 0.03
      );
    }
  };

  const updateWindowDimensions = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    lineOriginX = windowWidth / 2;
    lineOriginY = tutorialText.offsetHeight * 1.2;
  };

  const handleKeyframe = ({ text, getPosition, layers }) => {
    // just !text would return true on empty string, so:
    if (text !== undefined) {
      tutorialText.innerHTML = text;
    }
    getLineTarget = getPosition;
    lineEl.style.opacity = getPosition ? 1 : 0;
    if (layers) {
      minLayers = layers;
    }
  };

  textTimeline.on('keyframe', handleKeyframe);
  viewer.events.on('tick', tick);
  window.addEventListener('resize', updateWindowDimensions);
  updateWindowDimensions();

  return () => {
    viewer.camera.position.copy(originalCameraPosition);
    viewer.camera.zoom = originalZoom;
    viewer.camera.updateProjectionMatrix();

    window.removeEventListener('resize', updateWindowDimensions);
    audio.reset();
    Room.reset();
    audio.fadeOut();
    room.destroy();
    orb.destroy();
    orb2.destroy();
    viewer.camera.position.y = 0;
    viewer.camera.zoom = 1;
    viewer.camera.updateProjectionMatrix();
    viewer.events.off('tick', tick);
    textTimeline.off('keyframe', handleKeyframe);
  };
};
