import asyncEach from 'async/eachLimit';
import h from 'hyperscript';

import Room from './room';
import audio from './audio';
import viewer from './viewer';
import storage from './storage';
import layout from './room/layout';
import size from './utils/windowSize';
import { worldToScreen } from './utils/three';
import router from './router';

const easeOut = t => -t * (t - 2.0);

export default class Playlist {
  constructor({ recording } = {}) {
    const rooms = this.rooms = [];
    if (recording) {
      for (let index = 1; index < 20; index += 2) {
        const room = new Room({ recording, index });
        rooms.push(room);
      }
    }
  }

  async load({ url, pathRecording, pathRoomIndex }) {
    const entries = await storage.loadPlaylist(url);
    if (this.destroyed) return;

    await new Promise((resolve, reject) => {
      this.rooms = entries.map(
        (entry, index) => {
          if (process.env.FLAVOR === 'cms') {
            const days = Math.floor(entry.days_featured);
            const hours = Math.floor(entry.days_featured % 1 * 24);
            document.body.appendChild(
              h(
                `div.room-label#room-label-${index}`,
                {
                  onmousedown: (event) => {
                    router.navigate(`/choose/${index + 1}`);
                    event.stopPropagation();
                  },
                },
                h('span', `Room ${index + 1}`),
                h('span.wrap', entry.title === '' ? 'Unnamed' : entry.title),
                h(
                  'span.newline',
                  `Featured ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 0 ? 's' : ''}`
                ),
              )
            );
          }

          const isPathRecording = index === pathRoomIndex - 1;
          return new Room({
            url: isPathRecording
              ? `${pathRecording}`
              : process.env.FLAVOR === 'cms'
                ? entry.id
                : entry,
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
      if (layout.isOdd(room.index)) {
        time += audio.loopDuration;
      }
      // Slow down recordings to a stop after music stops:
      const slowdownDuration = 0.4;
      const maxTime = 216.824266 - (slowdownDuration * 0.5);
      if (audio.time > maxTime) {
        time = maxTime + easeOut(
          Math.min(
            slowdownDuration,
            audio.time - maxTime
          ) / slowdownDuration
        ) * slowdownDuration;
      }
      room.gotoTime(time % (audio.loopDuration * 2));

      if (process.env.FLAVOR === 'cms') {
        const coords = worldToScreen(viewer.camera, room.worldPosition);
        const label = document.getElementById(`room-label-${i}`);
        if (coords.x > 0 && coords.x < size.width && label && !label.classList.contains('mod-hidden')) {
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
