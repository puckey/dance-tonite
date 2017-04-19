import asyncEach from 'async/eachLimit';

import storage from './storage';
import Room from './room';
import audio from './audio';

export default class Playlist {
  constructor({ recording, url, pathRecording }, onLoad) {
    if (url) {
      storage.loadPlaylist(url, (error, urls) => {
        if (error) throw error;
        if (pathRecording) urls[1] = `${pathRecording}.json`;
        this.rooms = urls.map(
          (recordingUrl, index) => new Room({
            url: recordingUrl,
            showHead: !/head=false/.test(recordingUrl),
            index,
          }),
        );
        asyncEach(
          this.rooms,
          4,
          (room, callback) => {
            // If destroyed, callback with error to stop loading further files:
            if (this.destroyed) {
              return callback(Error('playlist was destroyed'));
            }
            room.load(callback);
          },
          () => {
            if (!this.destroyed) onLoad();
          },
        );
      });
    }
    if (recording) {
      const rooms = this.rooms = [];
      for (let i = 0; i < 10; i++) {
        rooms.push(new Room({ recording }));
      }
    }
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
      room.gotoTime(time % (audio.loopDuration * 2));
    }
  }

  destroy() {
    this.rooms.forEach(room => room.destroy());
    this.destroyed = true;
  }
}
