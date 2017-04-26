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

const { roomDepth, roomOffset } = settings;

export default (goto) => {

  const moveCamera = (progress) => {
    const z = ((progress - 1.5) * roomDepth) + roomOffset;
    viewer.camera.position.set(0, 1.6, z);
    orb.move(z);
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
