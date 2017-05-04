import Room from '../../room';
import Orb from '../../orb';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import createTimeline from '../../lib/timeline';
import controllers from '../../controllers';
import transition from '../../transition';
import instructions from '../../instructions';
import dp from '../../debugplane';
import { waitRoomColor, recordRoomColor } from '../../theme/colors';
import { sleep } from '../../utils/async';

const { roomDepth, roomOffset } = settings;

export default async (goto, req) => {
  const performFinish = async () => {
    instructions.remove();
    await Promise.all([
      // Wait for loop to finish:
      sleep(
        (audio.duration - audio.time) < (audio.loopDuration / 2)
        ? (audio.duration - audio.time + 0.1) * 1000
        : 0
      ).then(() => {
        recording.stop();
      }),
      audio.fadeOut(),
      transition.enter({
        text: 'Let’s review your performance',
      }),
    ]);
    goto('review');
  };

  const performStart = async () => {
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
        room.changeColor(waitRoomColor);
        orb2.fadeOut();
        orb.fadeIn();
        if (audio.totalProgress > 1) {
          controllers.update(pressToFinish);
        }
        instructions.setSubText('start in');
        instructions.beginCountdown(audio.loopDuration - audio.loopOffsetTime);
      },
    },
    {
      time: 1,
      callback: () => {
        room.changeColor(recordRoomColor);
        controllers.update();
      },
    },
  ]);

  const tick = () => {
    audio.tick();
    room.gotoTime(audio.time);
    const progress = audio.loopOffsetProgress - 1; // value between -1 and 1
    timeline.tick(audio.loopOffsetProgress);

    const z = (progress - 0.5) * roomDepth + roomOffset;
    orb.move(z);
    orb2.move(z + roomDepth * 2);

    recording.tick();
  };
  recording.setup({
    loopIndex: req.params.loopIndex
      || (Math.floor(Math.random() * settings.loopCount) + 1),
    hideHead: req.params.hideHead === '1',
  });

  await audio.load({
    src: `/public/sound/room-${recording.loopIndex}.ogg`,
    loops: 2,
    loopOffset: 0.5,
  });
  await transition.exit();

  instructions.add();
  instructions.setMainText('');
  instructions.setSubText('turn on your controllers');

  controllers.update(pressToStart);

  viewer.camera.position.z = 0;
  viewer.switchCamera('default');

  const room = new Room({ recording });
  room.changeColor(waitRoomColor);

  const orb = new Orb();
  const orb2 = new Orb();

  viewer.scene.add(dp.outline);
  controllers.add();
  return () => {
    instructions.remove();
    controllers.remove();
    viewer.events.off('tick', tick);
    audio.reset();
    Room.reset();
    audio.fadeOut();
    room.destroy();
    orb.destroy();
    orb2.destroy();
    viewer.scene.remove(dp.outline);
  };
};
