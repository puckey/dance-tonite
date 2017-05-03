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
import { Vector3 as Vector } from '../../lib/three';

const TUTORIAL_RECORDING_URL = '1033470119233-6feddefd.json';

const { roomDepth, roomOffset } = settings;

let windowWidth;
let windowHeight;
let lineOriginX;
let lineOriginY;
let lineTarget;
let renderLayerCount;

const getLineTransformString = (x1, y1, x2, y2) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

const get2DCoordinates = position => {
  const vector = new Vector();
  vector.copy(position);

  // map to normalized device coordinate (NDC) space
  vector.project(viewer.camera);

  // map to 2D screen space
  const x = Math.round((vector.x + 1) * windowWidth / 2);
  const y = Math.round((-vector.y + 1) * windowHeight / 2);

  return { x, y };
};

export default async (goto) => {
  const orb = new Orb();
  const orb2 = new Orb();

  const tutorialText = h('div.tutorial-text', '');
  const skipTutorialButton = h('div.skip-tutorial-button', 'Skip Tutorial');
  const noVRFoundOverlay = h(
    'div.no-vr-found-overlay.mod-hidden',
    h(
      'div.no-vr-found-overlay-text',
      'Connect a VR headset to continue'
    )
  );
  const closeButton = h('div.close-button', { onclick: () => { router.navigate('/'); } }, '×');
  const line = h('div.line');

  document.querySelector('.hud').appendChild(line);
  document.querySelector('.hud').appendChild(tutorialText);
  document.querySelector('.hud').appendChild(skipTutorialButton);
  document.querySelector('.hud').appendChild(noVRFoundOverlay);
  document.querySelector('.hud').appendChild(closeButton);

  skipTutorialButton.classList.remove('mod-hidden');

  await audio.load({
    src: '/public/sound/room-7.ogg',
    loops: 2,
  });

  viewer.switchCamera('orthographic');
  viewer.camera.position.z = 1.3;
  viewer.camera.position.y = 2;
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
    if (typeof navigator.getVRDisplays === 'function') {
      const devices = await navigator.getVRDisplays();
      if (devices.length > 0) {
        skipTutorialButton.classList.add('mod-hidden');
        await hud.enterVR();
        viewer.vrEffect.requestPresent();
        goto('record');
        return;
      }
    }
    noVRFoundOverlay.classList.remove('mod-hidden');
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
      time: 0,
      layers: 1,
    },
    {
      time: 1,
      text: 'This is you',
      position: orb.mesh.position,
    },
    {
      time: 4,
      text: 'This is the camera',
      position: orb.mesh.position,
    },
    {
      time: 7,
      text: 'Dance!',
    },
    {
      time: 15,
      text: 'Cut!',
      layers: 2,
    },
    {
      time: 17,
      text: 'Prepare for the next recording',
    },
    {
      time: 20,
      text: 'This is you',
      position: orb.mesh.position,
    },
    {
      time: 23,
      text: 'This is your previous recording',
      position: orb.mesh.position,
    },
    {
      time: 28,
      text: 'Add up to 10 copies of yourself',
      layers: 4,
    },
    {
      time: 37.5,
      callback: performSkip,
    },
  ]);

  const tick = () => {
    audio.tick();
    room.gotoTime(audio.time, renderLayerCount);
    const progress = audio.progress - 1; // value between -1 and 1
    colorTimeline.tick(audio.progress);
    textTimeline.tick(audio.currentTime);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    orb.move(z);
    orb2.move(z - roomDepth * 2);

    if (lineTarget) {
      const { x, y } = get2DCoordinates(lineTarget);
      line.style.opacity = 1;
      line.style.transform = getLineTransformString(
        x,
        y,
        lineOriginX,
        lineOriginY
      );
    } else {
      line.style.opacity = 0;
    }
  };

  const updateWindowDimensions = () => {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    lineOriginX = windowWidth / 2;
    lineOriginY = tutorialText.offsetHeight;
  };

  textTimeline.on('keyframe', ({ text, position, layers }) => {
    if (text) {
      tutorialText.innerHTML = text;
    }
    if (layers) {
      renderLayerCount = layers;
    }
    lineTarget = position;
  });

  viewer.events.on('tick', tick);
  skipTutorialButton.addEventListener('click', performSkip);
  window.addEventListener('resize', updateWindowDimensions);
  updateWindowDimensions();

  return () => {
    window.removeEventListener('resize', updateWindowDimensions);
    skipTutorialButton.removeEventListener('click', performSkip);
    document.querySelector('.hud').removeChild(tutorialText);
    document.querySelector('.hud').removeChild(noVRFoundOverlay);
    document.querySelector('.hud').removeChild(skipTutorialButton);
    document.querySelector('.hud').removeChild(closeButton);
    document.querySelector('.hud').removeChild(line);
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
  };
};
