import * as THREE from '../../lib/three';
import audio from '../../audio';
import Playlist from '../../playlist';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import storage from '../../storage';
import router from '../../router';
import controllers from '../../controllers';
import transition from '../../transition';
import Room from '../../room';
import { tempVector } from '../../utils/three';

const { roomDepth, roomOffset } = settings;
const MATRIX = new THREE.Matrix4();
const POSITION = new THREE.Vector3();
const ROTATION = new THREE.Quaternion();
const SCALE = new THREE.Vector3();

export default (goto) => {

  const moveCamera = (progress) => {
    const zPos = ((progress - 1.5) * roomDepth) + roomOffset;
    const fixedPosition = tempVector(0, 1.6, zPos);

    // Move controllers relative to fixed camera:
    viewer.controllers.forEach(controller => {
      controller.matrix.decompose(POSITION, ROTATION, SCALE);
      const { x, y, z } = POSITION.add(fixedPosition).sub(viewer.camera.position);
      controller.matrix.copyPosition(MATRIX.makeTranslation(x, y, z));
    });

    viewer.camera.position.copy(fixedPosition);
  };

  moveCamera(0);
  const playlist = new Playlist({ recording });
  const tick = () => {
    audio.tick();
    playlist.tick();
    moveCamera(audio.totalProgress);
  };

  audio.load({
    src: `/public/sound/room-${recording.room}.ogg`,
    loops: 2,
  }, (loadError) => {
    if (loadError) throw loadError;
    transition.exit(() => {
      controllers.update({
        left: {
          text: 'press to redo',
          onPress: () => {
            viewer.events.off('tick', tick);
            transition.enter({ text: 'Okay, here we go again', duration: 2000 },
              () => {
                goto('record');
              }
            );
          },
        },
        right: {
          text: 'press to submit',
          onPress: () => {
            //  explicitly hide
            controllers.hideButton();
            controllers.update({
              right: {
                text: 'submitting',
              },
            });
            storage.persist(
              recording.toJson(),
              (error, uri) => {
                if (error) return console.log(error);
                viewer.events.off('tick', tick);
                transition.enter({ text: 'Please take off your headset', duration: 2000 },
                  () => {
                    router.navigate(`/${uri.replace('.json', '')}`);
                  }
                );
              }
            );
          },
        },
      });
    });
    audio.play();
    viewer.events.on('tick', tick);
  });

  return () => {
    Room.reset();
    audio.fadeOut();
    playlist.destroy();
  };
};
