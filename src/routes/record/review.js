import Orb from '../../orb';
import audio from '../../audio';
import Playlist from '../../playlist';
import viewer from '../../viewer';
import settings from '../../settings';
import recording from '../../recording';
import storage from '../../storage';
import router from '../../router';
import controllers from '../../controllers';
import Room from '../../room';

const { roomDepth, roomOffset } = settings;

export default (goto) => {
  const orb = new Orb();

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
    audio.play();
    viewer.events.on('tick', tick);
  });

  controllers.update({
    left: {
      text: 'press to redo',
      onPress: () => goto('record'),
    },
    right: {
      text: 'press to submit',
      onPress: () => {
        storage.persist(
          recording.toJson(),
          (error, uri) => {
            if (error) return console.log(error);
            router.navigate(`/${uri.replace('.json', '')}`);
          }
        );
      },
    },
  });

  return () => {
    Room.reset();
    audio.fadeOut();
    viewer.events.off('tick', tick);
    orb.destroy();
    playlist.destroy();
  };
};
