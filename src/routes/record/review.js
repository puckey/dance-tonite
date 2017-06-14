import * as THREE from '../../lib/three';
import audio from '../../audio';
import Playlist from '../../playlist';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import storage from '../../storage';
import controllers from '../../controllers';
import transition from '../../transition';
import Room from '../../room';
import hud from '../../hud';
import router from '../../router';
import { tempVector } from '../../utils/three';
import { sleep } from '../../utils/async';

export default (goto) => {
  const { roomDepth, roomOffset } = settings;
  const MATRIX = new THREE.Matrix4();
  const POSITION = new THREE.Vector3();
  const ROTATION = new THREE.Quaternion();
  const SCALE = new THREE.Vector3();

  const moveCamera = (progress) => {
    const zPos = roomOffset + ((progress - 1) * roomDepth);
    const fixedPosition = tempVector(0, settings.holeHeight, -zPos);

    // Move controllers relative to fixed camera:
    viewer.controllers.forEach(controller => {
      controller.matrix.decompose(POSITION, ROTATION, SCALE);
      const { x, y, z } = POSITION.add(fixedPosition).sub(viewer.camera.position);
      controller.matrix.copyPosition(MATRIX.makeTranslation(x, y, z));
    });

    viewer.camera.position.copy(fixedPosition);
  };

  let playlist;

  const tick = () => {
    Room.clear();
    audio.tick();
    playlist.tick();
    moveCamera(audio.totalProgress + 0.5);
  };

  const performSubmit = async () => {
    controllers.update();
    const persisting = storage.persist(recording.serialize(), recording.roomIndex);
    audio.fadeOut();

    await transition.fadeOut();
    if (component.destroyed) return;

    viewer.events.off('tick', tick);
    const [recordingSrc] = await Promise.all([
      persisting,
      transition.enter({
        text: 'Please take off your headset',
      }),
      sleep(5000),
    ]);

    if (component.destroyed) return;

    goto(`/${recording.roomIndex}/${recordingSrc.replace('.json', '')}`);
  };

  const performRedo = async () => {
    audio.fadeOut();

    await transition.fadeOut();
    if (component.destroyed) return;

    viewer.events.off('tick', tick);

    await transition.enter({
      text: 'Okay, here we go again',
      duration: 5000,
    });
    if (component.destroyed) return;

    goto('record');
  };

  const component = {
    mount: async () => {
      Room.reset();
      Room.rotate180();
      playlist = new Playlist({ recording });

      await Promise.all(
        [
          audio.load({
            src: `/public/sound/room-${recording.loopIndex || 1}.ogg`,
            loops: 2,
          }),
          sleep(5000),
        ]
      );
      if (component.destroyed) return;

      await transition.fadeOut();
      if (component.destroyed) return;

      audio.play();
      viewer.events.on('tick', tick);
      controllers.update({
        left: {
          text: 'press to redo',
          onPress: performRedo,
          removeOnPress: true,
        },
        right: {
          text: 'press to submit',
          onPress: performSubmit,
          removeOnPress: true,
        },
      });
      controllers.add();

      // Create close button
      hud.create('div.close-button',
        {
          onclick: () => router.navigate('/'),
        },
        '×'
      );

      transition.exit();
    },

    unmount() {
      component.destroyed = true;
      controllers.update();
      controllers.remove();
      audio.fadeOut();
      playlist.destroy();
    },
  };

  return component;
};
