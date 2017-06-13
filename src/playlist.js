import asyncEach from 'async/eachLimit';
import h from 'hyperscript';

import Room from './room';
import audio from './audio';
import viewer from './viewer';
import storage from './storage';
import layout from './room/layout';
import size from './utils/windowSize';
import { worldToScreen } from './utils/three';
import cms from './utils/firebase/cms';
import router from './router';

export default class Playlist {
  constructor({ recording } = {}) {
    this.isRecording = !!recording;
    const rooms = this.rooms = [];
    if (recording) {
      for (let index = 1; index < 20; index += 2) {
        const room = new Room({ recording, index });
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
          if (process.env.FLAVOR === 'cms') {
            cms.getRecording(recordingUrl).then(({ data }) => {
              document.body.appendChild(
                h(
                  `div.room-label#room-label-${index}`, { onclick: () => router.navigate(`/choose/${index}`) },
                  h('span', `Room ${index}`),
                  h('span.wrap', data.title),
                  h('span.newline', `Featured: ${data.days_featured} day${data.days_featured > 1 ? 's' : ''}`),
                )
              );
            });
          }

          const isPathRecording = index === pathRoomIndex - 1;
          return new Room({
            url: isPathRecording
              ? `${pathRecording}`
              : recordingUrl,
            index,
            pathRecording: isPathRecording,
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
      if (layout.isOdd(room.placementIndex)) {
        time += audio.loopDuration;
      }
      room.gotoTime(time % (audio.loopDuration * 2));

      if (process.env.FLAVOR === 'cms') {
        const coords = worldToScreen(viewer.camera, room.worldPosition);
        const label = document.getElementById(`room-label-${i}`);
        if (coords.x > 0 && coords.x < size.width && label) {
          label.classList.remove('mod-removed');
          label.style.transform = `translate(${coords.x}px, ${coords.y}px)`;
        } else if (label) {
          label.classList.add('mod-removed');
        }
      }
    }
  }

  destroy() {
    this.rooms.forEach((room, index) => {
      room.destroy();
      if (process.env.FLAVOR === 'cms') {
        document.body.removeChild(document.getElementById(`room-label-${index}`));
      }
    });
    this.destroyed = true;
  }
}
