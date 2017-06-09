import asyncEach from 'async/eachLimit';

import storage from './storage';
import Room from './room';
import audio from './audio';
import { recordRoomColor } from './theme/colors';
import layout from './room/layout';

export default class Playlist {
  constructor({ recording } = {}) {
    const rooms = this.rooms = [];
    if (recording) {
      for (let index = 1; index < 20; index += 2) {
        const room = new Room({ recording, index });
        room.changeColor(recordRoomColor);
        rooms.push(room);
      }
    }
  }

  async load({ url, pathRecording, pathRoomIndex }) {
    const urls = await storage.loadPlaylist(url);
    if (this.destroyed) return;
    await new Promise((resolve, reject) => {
      this.rooms = urls.map(
        (recordingUrl, index) => {
          const isPathRecording = index === pathRoomIndex - 1;
          return new Room({
            url: isPathRecording
              ? `${pathRecording}.json`
              : recordingUrl,
            index
          });
        },
      );
      const destroyedErrorName = 'playlist destroyed';
      asyncEach(
        this.rooms,
        4,
        (room, callback) => {
          // If destroyed, callback with error to stop loading further files:
          if (this.destroyed) {
            return callback(Error(destroyedErrorName));
          }
          room.load(callback);
        },
        (error) => {
          if (error && error.name !== destroyedErrorName) {
            reject(error);
          } else {
            resolve();
          }
        },
      );
    });
  }

  tick() {
    if (!this.rooms) return;
    for (let i = 0; i < this.rooms.length; i++) {
      const room = this.rooms[i];
      let time = audio.time;
      if (layout.isOdd(room.index)) {
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
