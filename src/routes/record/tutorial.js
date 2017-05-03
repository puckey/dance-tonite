import h from 'hyperscript';
import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import createTimeline from '../../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../../theme/colors';
import { Vector3 as Vector } from '../../lib/three';

const TUTORIAL_RECORDING_URL = '1033470119233-6feddefd.json';

const { roomDepth, roomOffset } = settings;

const tutorialText = h('div.tutorial-text', '');
const skipTutorialButton = h('div.skip-tutorial-button', 'Skip Tutorial');
const line = h('div.line');

let windowWidth;
let windowHeight;
let lineOriginX;
let lineOriginY;

const getLineTransformString = (x1, y1, x2, y2) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${length / 100})`;
};

const updateWindowDimensions = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  lineOriginX = windowWidth / 2;
  lineOriginY = tutorialText.offsetHeight;
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
  const performSkip = () => {
    skipTutorialButton.classList.add('mod-hidden');
    goto('record');
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
      time: 2,
      text: 'This is you',
    },
    {
      time: 4,
      text: 'This is the camera',
    },
    {
      time: 7,
      text: 'Dance!',
    },
    {
      time: 9,
      text: '',
    },
    {
      time: 15,
      text: 'Cut!',
    },
    {
      time: 17,
      text: 'Relax',
    },
    {
      time: 18,
      text: '',
    },
  ]);

  textTimeline.on('keyframe', ({ text }) => {
    if (text) {
      tutorialText.innerHTML = text;
    }
  });

  const tick = () => {
    audio.tick();
    room.gotoTime(audio.time);
    const progress = audio.progress - 1; // value between -1 and 1
    colorTimeline.tick(audio.progress);
    textTimeline.tick(audio.currentTime);

    const z = (progress - 0.5) * -roomDepth - roomOffset;
    orb.move(z);
    orb2.move(z - roomDepth * 2);

    const { x, y } = get2DCoordinates(orb.mesh.position);
    line.style.transform = getLineTransformString(
      x,
      y,
      lineOriginX,
      lineOriginY
    );
  };

  document.querySelector('.hud').appendChild(tutorialText);
  document.querySelector('.hud').appendChild(skipTutorialButton);
  document.querySelector('.hud').appendChild(line);

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

  const orb = new Orb();
  const orb2 = new Orb();

  audio.play();
  audio.mute();
  audio.fadeIn();
  viewer.events.on('tick', tick);
  skipTutorialButton.addEventListener('click', performSkip);
  window.addEventListener('resize', updateWindowDimensions);
  updateWindowDimensions();

  return () => {
    window.removeEventListener('resize', updateWindowDimensions);
    skipTutorialButton.removeEventListener('click', performSkip);
    document.querySelector('.hud').removeChild(tutorialText);
    document.querySelector('.hud').removeChild(skipTutorialButton);
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
