import asyncEach from 'async/eachLimit';

import storage from './storage';
import Room from './room';
import audio from './audio';

export default class Playlist {
  constructor({ recording } = {}) {
    this.isRecording = !!recording;
    if (recording) {
      const rooms = this.rooms = [];
      for (let i = 0; i < 10; i++) {
        rooms.push(new Room({ recording }));
      }
    }
  }

  async load({ url, pathRecording, loopIndex }) {
    const urls = await storage.loadPlaylist(url);
    if (pathRecording) urls[loopIndex - 1] = `${pathRecording}.json`;
    this.rooms = urls.map(
      (recordingUrl, index) => new Room({
        url: recordingUrl,
        index,
      }),
    );
    asyncEach(
      this.rooms,
      3,
      (room, callback) => {
        // If destroyed, callback with error to stop loading further files:
        if (this.destroyed) {
          return callback(Error('playlist was destroyed'));
        }
        room.load(callback);
      },
    );
  }

  tick() {
    if (!this.rooms) return;
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      let time = audio.time;
      const oddRoom = i % 2 === 0;
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
