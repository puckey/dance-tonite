import 'babel-polyfill';
import eachLimit from 'async/eachLimit';

import './index.scss';
import viewer from './viewer';
import props from './props';
import settings from './settings';
import Room from './room';
import * as THREE from './lib/three';
import storage from './storage';
import Orb from './orb';
import audio from './audio';
import audioSrc from './public/sound/lcd-14loops.mp3';

window.THREE = THREE;

props.prepare(() => {
  storage.loadPlaylist('curated', (error, playlist) => {
    if (error) throw error;
    audio.load({
      src: audioSrc,
      loops: 16,
    }, (loadError) => {
      if (loadError) throw loadError;

      audio.play();

      const orb = new Orb();

      const rooms = playlist.map(url => new Room({
        showHead: !/head=false/.test(url),
        url
      }));

      eachLimit(rooms, 4,
        (room, callback) => room.load(callback),
        (roomLoadError) => {
          if (roomLoadError) throw roomLoadError;
          // Done loading rooms
        },
      );

      const { roomDepth, roomOffset } = settings;
      const tick = () => {
        audio.tick();
        viewer.camera.position.z = ((audio.progress - 1.5) * roomDepth) + roomOffset;
        orb.move(viewer.camera.position.z);
        rooms.forEach(room => {
          // Offset every other room in time by a loop, so whenever our floating
          // camera enters the room, we are seeing a recording:
          let time = audio.time;
          const oddRoom = room.index % 2 === 1;
          if (oddRoom) {
            time += audio.loopDuration;
          }
          room.gotoTime(time);
        });
      };

      viewer.events.on('tick', tick);

      Room.switchModel('ortographic');
      viewer.switchCamera('ortographic');
    });
  });
});
