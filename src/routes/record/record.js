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

export default (goto, req) => {
  const { roomDepth, roomOffset } = settings;

  let room;
  let orb;
  let orb2;

  const performFinish = async () => {
    instructions.reset();
    await Promise.all([
      // Wait for loop to finish:
      sleep(
        (audio.duration - audio.time) < (audio.loopDuration / 2)
        ? (audio.duration - audio.time + 0.1) * 1000
        : 0
      ).then(() => {
        if (!component.destroyed) recording.stop();
      }),
      audio.fadeOut(),
      transition.enter({
        text: 'Let’s review your performance',
      }),
    ]);
    if (!component.destroyed) goto('review');
  };

  const performStart = async () => {
    audio.play();
    audio.mute();
    audio.fadeIn();
    viewer.events.on('tick', tick);
  };

  const pressToFinish = {
    left: {
      text: 'press to restart',
      removeOnPress: true,
      onPress: async () => {
        await transition.enter({
          text: 'Let’s try that again...',
        });
        if (!component.destroyed) goto('record');
      },
    },
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
        instructions.beginCountdown(audio.loopDuration - audio.time);
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
    const progress = audio.progress - 1; // value between -1 and 1
    timeline.tick(audio.progress);

    const z = (progress - 0.5) * roomDepth + roomOffset;
    orb.move(z);
    if (audio.totalProgress > 1) {
      orb2.move(z + roomDepth * 2);
    }
    recording.tick();
  };
  recording.setup({
    loopIndex: req.params.loopIndex
      || (Math.floor(Math.random() * settings.loopCount) + 1),
    hideHead: req.params.hideHead === '1',
  });

  const component = {
    mount: async () => {
      await audio.load({
        src: `/public/sound/room-${recording.loopIndex}.ogg`,
        loops: 2,
        loopOffset: 0.5,
      });
      if (component.destroyed) return;

      viewer.switchCamera('default');
      room = new Room({ recording });
      room.changeColor(waitRoomColor);

      instructions.add();
      instructions.setMainText('');
      instructions.setSubText('turn on your controllers');

      controllers.update(pressToStart);
      controllers.add();

      orb = new Orb();
      orb2 = new Orb();

      viewer.scene.add(dp.outline);

      if (transition.isInside()) {
        await transition.exit();
      }
    },

    unmount: () => {
      component.destroyed = true;
      instructions.reset();
      controllers.update();
      controllers.remove();
      viewer.events.off('tick', tick);
      audio.reset();
      Room.reset();
      audio.fadeOut();
      if (room) {
        room.destroy();
        orb.destroy();
        orb2.destroy();
      }
      viewer.scene.remove(dp.outline);
    },
  };

  return component;
};
