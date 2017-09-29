/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import settings from '../settings';
import { tempVector } from '../utils/three';

const { roomWidth, roomHeight, roomDepth, roomOffset } = settings;
const ph = { type: 'PLANE', timeline: false, megagrid: true };
const plh = { type: 'PLANE', megagrid: true };
const em = { type: 'EMPTY' };
const ho = { type: 'HORIZONTAL', room: true };
const hfw = Object.assign({ frontWall: true }, ho);
const hbw = Object.assign({ backWall: true }, ho);
let rooms = [
  [0, 0, -3, em],
  [0, 0, -2, em],
  [0, 0, -1, em],
  [0, 0, 0, hfw],
  [0, 0, 1, ho],
  [0, 0, 2, ho],
  [0, 0, 3, ho],
  [0, 0, 4, ho],
  [0, 0, 5, ho],
  [0, 0, 6, ho],
  [0, 0, 7, ho],
  [0, 0, 8, ho],
  [0, 0, 9, ho],
  [0, 0, 10, ho],
  [0, 0, 11, ho],
  [0, 0, 12, ho],
  [0, 0, 13, ho],
  [0, 0, 14, ho],
  [0, 0, 15, ho],
  [0, 0, 16, ho],
  [0, 0, 17, ho],
  [0, 0, 18, hbw],
  [-3, 0, 19, ph, 3], [-2, 0, 19, ph, 4], [-1, 0, 19, ph, 5], [0, 0, 19, plh, 8], [1, 0, 19, ph, 5], [2, 0, 19, ph, 4], [3, 0, 19, ph, 3],
  [-3, 0, 20, ph, 2], [-2, 0, 20, ph, 3], [-1, 0, 20, ph, 2], [0, 0, 20, plh, 1], [1, 0, 20, ph, 2], [2, 0, 20, ph, 3], [3, 0, 20, ph, 2],
  [-3, 0, 21, ph, 3], [-2, 0, 21, ph, 6], [-1, 0, 21, ph, 1], [0, 0, 21, plh, 0], [1, 0, 21, ph, 1], [2, 0, 21, ph, 6], [3, 0, 21, ph, 3],
  [-3, 0, 22, ph, 5], [-2, 0, 22, ph, 2], [-1, 0, 22, ph, 3], [0, 0, 22, plh, 6], [1, 0, 22, ph, 3], [2, 0, 22, ph, 2], [3, 0, 22, ph, 5],
  [-3, 0, 23, ph, 4], [-2, 0, 23, ph, 3], [-1, 0, 23, ph, 2], [0, 0, 23, plh, 3], [1, 0, 23, ph, 3], [2, 0, 23, ph, 3], [3, 0, 23, ph, 4],
  [-3, 0, 24, ph, 3], [-2, 0, 24, ph, 4], [-1, 0, 24, ph, 4], [0, 0, 24, plh, 2], [1, 0, 24, ph, 4], [2, 0, 24, ph, 4], [3, 0, 24, ph, 3],
  [-3, 0, 25, ph, 6], [-2, 0, 25, ph, 5], [-1, 0, 25, ph, 5], [0, 0, 25, plh, 4], [1, 0, 25, ph, 5], [2, 0, 25, ph, 5], [3, 0, 25, ph, 6],
  [-2, 0, 26, ph, 5], [-1, 0, 26, ph, 6], [0, 0, 26, plh, 4], [1, 0, 26, ph, 6], [2, 0, 26, ph, 5],
  [-1, 0, 27, ph, 6], [0, 0, 27, plh, 5], [1, 0, 27, ph, 6],
  [0, 0, 28, em],
  [0, 0, 29, em],
  [0, 0, 30, em],
  [0, 0, 31, em],
  [0, 0, 32, em],
];

if (process.env.FLAVOR === 'cms') {
  rooms = rooms.filter(([,,, { type }]) => type !== ph);
  rooms.forEach((room) => {
    const type = room[3];
    if (type === plh) {
      room[3] = em;
    }
  });
}

const layout = rooms.filter(([,,, { type }]) => type !== 'EMPTY');

const timelineLayout = rooms.filter(([,,, { timeline }]) => timeline !== false);

const playlistLayout = layout.filter(([,,, { megagrid }]) => !megagrid);

const getRoomType = index => layout[index][3];

export default {
  getPosition(position, roomPosition, single) {
    let x = 0;
    let y = 0;
    let z = 0;
    if (single) {
      z = roomOffset;
    } else {
      const lower = Math.floor(position);
      const higher = Math.ceil(position);
      const ratio = position % 1;
      const roomsLayout = roomPosition ? layout : timelineLayout;
      const [x1, y1, z1] = roomsLayout[lower];
      const [x2, y2, z2] = roomsLayout[higher];
      x = (x1 + (x2 - x1) * ratio) * roomWidth;
      y = (y1 + (y2 - y1) * ratio) * roomHeight;
      z = (z1 + (z2 - z1) * ratio) * (roomDepth + 0.0001) + roomOffset;
    }
    return roomPosition
      ? roomPosition.set(x, y, z)
      : tempVector(x, y, z);
  },

  hasFrontWall(index) {
    return !!getRoomType(index).frontWall;
  },

  hasBackWall(index) {
    return !!getRoomType(index).backWall;
  },

  hasRoom(index) {
    return !!getRoomType(index).room;
  },

  isEven(index) {
    return layout[index][2] % 2 === 0;
  },

  insideMegaGrid(index) {
    return !!getRoomType(index).megagrid;
  },

  getSynthIndex(index) {
    const synthIndex = layout[index][4];
    return synthIndex === undefined ? 3 : synthIndex;
  },

  playlistIndexToMegaGridIndex(index) {
    return layout.indexOf(playlistLayout[index]);
  },

  getPlaylistIndex(index) {
    return playlistLayout.indexOf(layout[index]);
  },

  getRoom(index) {
    return layout[index];
  },

  roomCount: layout.length,
};
