import asyncEach from 'async/each';

import storage from './storage';
import Room from './room';
import audio from './audio';

export default class Playlist {
  constructor(id, onLoad) {
    this.id = id;

    storage.loadPlaylist(id, (error, urls) => {
      if (error) throw error;

      this.rooms = urls.map(
        url => new Room(
          {
            url,
            showHead: !/head=false/.test(url),
          },
        ),
      );
      asyncEach(
        this.rooms,
        (room, callback) => room.load(callback),
        onLoad,
      );
    });
  }

  tick() {
    if (!this.rooms) return;
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      let time = audio.time;
      const oddRoom = i % 2 === 1;
      if (oddRoom) {
        time += audio.loopDuration;
      }
      room.gotoTime(time);
    }
  }

  destroy() {
    this.rooms.forEach(room => room.destroy());
  }
}
