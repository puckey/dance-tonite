import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import { Color } from '../../lib/three';
import createTimeline from '../../lib/timeline';
import controllers from '../../controllers';

const RECORD_COLOR = new Color(0, 1, 0);
const WAIT_COLOR = new Color(0, 0, 1);

const { roomDepth, roomOffset } = settings;

export default (goto) => {
  const pressToFinish = {
    right: {
      text: 'press to finish',
      onPress: () => goto('review'),
    },
  };

  const timeline = createTimeline([
    {
      time: 0,
      callback: () => {
        room.changeColor(WAIT_COLOR);
        orb2.fadeOut();
        controllers.update(pressToFinish);
      },
    },
    {
      time: 1,
      callback: () => {
        room.changeColor(RECORD_COLOR);
        controllers.update();
      },
    },
  ]);

  const tick = () => {
    audio.tick();
    room.gotoTime(audio.time);
    const progress = audio.progress - 1; // value between -1 and 1
    timeline.tick(audio.progress);

    const z = (progress - 0.5) * roomDepth + roomOffset;
    orb.move(z);
    orb2.move(z + roomDepth * 2);

    recording.tick();
  };

  recording.reset();
  recording.room = Math.floor(Math.random() * settings.loopCount) + 1;
  viewer.camera.position.z = 0;
  viewer.switchCamera('default');

  const room = new Room({ recording });
  room.changeColor(WAIT_COLOR);

  const orb = new Orb();
  const orb2 = new Orb();

  audio.load(
    {
      src: `/public/sound/room-${recording.room}.ogg`,
      loops: 2,
    },
    loadError => {
      if (loadError) throw loadError;
      audio.play();
      viewer.events.on('tick', tick);
    }
  );
  const destroy = () => {
    Room.reset();
    audio.fadeOut();
    room.destroy();
    orb.destroy();
    orb2.destroy();
    viewer.events.off('tick', tick);
  };

  return destroy;
};
