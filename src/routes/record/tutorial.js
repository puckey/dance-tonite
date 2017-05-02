import h from 'hyperscript';
import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import createTimeline from '../../lib/timeline';
import { waitRoomColor, recordRoomColor } from '../../theme/colors';

const TUTORIAL_RECORDING_URL = '1033470119233-6feddefd.json';

const { roomDepth, roomOffset } = settings;

const getLineTransformString = (x1, y1, x2, y2) => {
  const length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return `rotate(${angle}) scaleX(${length / 100}) translate(${x1}, ${y1})`;
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
  };

  window.onResize = () => {
    tutorialTextHeight = tutorialText.height;
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  };

  const tutorialText = h('div.tutorial-text', '');
  const skipTutorialButton = h('div.skip-tutorial-button', 'Skip Tutorial');

  document.querySelector('.hud').appendChild(tutorialText);
  document.querySelector('.hud').appendChild(skipTutorialButton);

  let tutorialTextHeight = tutorialText.height;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  await audio.load({
    src: '/public/sound/room-7.ogg',
    loops: 2,
  });

  viewer.switchCamera('orthographic');
  viewer.camera.position.z = 1;
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

  return () => {
    skipTutorialButton.removeEventListener('click', performSkip);
    document.querySelector('.hud').removeChild(tutorialText);
    document.querySelector('.hud').removeChild(skipTutorialButton);
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
