import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import { Color } from '../../lib/three';
import createTimeline from '../../lib/timeline';
import controllers from '../../controllers';
import transition from '../../transition';
import instructions from '../../instructions';

const RECORD_COLOR = new Color(0x55b848);
const WAIT_COLOR = new Color(0xcccccc);

const { roomDepth, roomOffset } = settings;

export default async (goto) => {
  const performFinish = async () => {
    await transition.fadeOut();
    goto('review');
    await transition.enter({
      text: 'Let\'s review your performance',
    });
  };

  const performStart = async () => {
    // TODO: preload audio
    await audio.load({
      src: `/public/sound/room-${recording.room}.ogg`,
      loops: 2,
    });
    instructions.add();
    await instructions.beginCountdown(8);
    audio.play();
    audio.mute();
    audio.fadeIn();
    viewer.events.on('tick', tick);
  };

  const pressToFinish = {
    right: {
      text: 'press to finish',
      removeOnPress: true,
      onPress: performFinish,
    },
  };

  const pressToStart = {
    right: {
      text: 'press to start',
      removeOnPress: true,
      onPress: performStart,
    },
  };

  const timeline = createTimeline([
    {
      time: 0,
      callback: () => {
        room.changeColor(WAIT_COLOR);
        orb2.fadeOut();
        orb.fadeIn();
        if (audio.totalProgress > 1) {
          controllers.update(pressToFinish);
        }
        instructions.beginCountdown(audio.loopDuration);
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

  await transition.exit();

  controllers.update(pressToStart);

  recording.reset();
  recording.room = Math.floor(Math.random() * settings.loopCount) + 1;
  viewer.camera.position.z = 0;
  viewer.switchCamera('default');

  const room = new Room({ recording });
  room.changeColor(WAIT_COLOR);

  const orb = new Orb();
  const orb2 = new Orb();

  const destroy = () => {
    audio.reset();
    Room.reset();
    audio.fadeOut();
    room.destroy();
    orb.destroy();
    orb2.destroy();
    viewer.events.off('tick', tick);
  };

  await performStart();

  return destroy;
};
