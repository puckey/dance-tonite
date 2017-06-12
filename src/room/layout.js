import settings from '../settings';
import { tempVector } from '../utils/three';

const { roomWidth, roomHeight, roomDepth, roomOffset } = settings;
const ph = { type: 'PLANE', timeline: false, megagrid: true };
const plh = { type: 'PLANE', megagrid: true };
const em = { type: 'EMPTY' };
const ho = { type: 'HORIZONTAL' };
const hw = { type: 'HORIZONTAL', wall: true };

const rooms = [
  [0, 0, -3, em],
  [0, 0, -2, em],
  [0, 0, -1, em],
  [0, 0, 0, hw],
  [0, 0, 1, ho],
  [0, 0, 2, ho],
  [0, 0, 3, ho],
  [0, 0, 4, ho],
  [0, 0, 5, ho],
  [0, 0, 6, ho],
  [0, 0, 7, ho],
  [0, 0, 8, ho],
  [0, 0, 9, hw],
  [0, 0, 10, ho],
  [0, 0, 11, ho],
  [0, 0, 12, ho],
  [0, 0, 13, ho],
  [0, 0, 14, ho],
  [0, 0, 15, ho],
  [0, 0, 16, ho],
  [-1, 0, 17, ph], [0, 0, 17, ho], [1, 0, 17, ph],
  [-2, 0, 18, ph], [-1, 0, 18, ph], [0, 0, 18, ho], [1, 0, 18, ph], [2, 0, 18, ph],
  [-3, 0, 19, ph], [-2, 0, 19, ph], [-1, 0, 19, ph], [0, 0, 19, plh], [1, 0, 19, ph], [2, 0, 19, ph], [3, 0, 19, ph],
  [-3, 0, 20, ph], [-2, 0, 20, ph], [-1, 0, 20, ph], [0, 0, 20, plh], [1, 0, 20, ph], [2, 0, 20, ph], [3, 0, 20, ph],
  [-3, 0, 21, ph], [-2, 0, 21, ph], [-1, 0, 21, ph], [0, 0, 21, plh], [1, 0, 21, ph], [2, 0, 21, ph], [3, 0, 21, ph],
  [-3, 0, 22, ph], [-2, 0, 22, ph], [-1, 0, 22, ph], [0, 0, 22, plh], [1, 0, 22, ph], [2, 0, 22, ph], [3, 0, 22, ph],
  [-3, 0, 23, ph], [-2, 0, 23, ph], [-1, 0, 23, ph], [0, 0, 23, plh], [1, 0, 23, ph], [2, 0, 23, ph], [3, 0, 23, ph],
  [-3, 0, 24, ph], [-2, 0, 24, ph], [-1, 0, 24, ph], [0, 0, 24, plh], [1, 0, 24, ph], [2, 0, 24, ph], [3, 0, 24, ph],
  [-3, 0, 25, ph], [-2, 0, 25, ph], [-1, 0, 25, ph], [0, 0, 25, plh], [1, 0, 25, ph], [2, 0, 25, ph], [3, 0, 25, ph],
  [-2, 0, 26, ph], [-1, 0, 26, ph], [0, 0, 26, plh], [1, 0, 26, ph], [2, 0, 26, ph],
  [-1, 0, 27, ph], [0, 0, 27, plh], [1, 0, 27, ph],
  [0, 0, 28, em],
  [0, 0, 29, em],
  [0, 0, 30, em],
];

const layout = rooms.filter(([,,, { type }]) => type !== 'EMPTY');

const timelineLayout = rooms.filter(([,,, { timeline }]) => timeline !== false);

export default {
  getPosition(position, roomPosition, reviewMode) {
    let x = 0;
    let y = 0;
    let z = 0;
    if (reviewMode) {
      z = position * roomDepth + roomOffset;
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

  loopIndex(roomIndex) {
    const [, y, z] = layout[roomIndex];
    return (z + Math.abs(Math.round(y)));
  },

  hasWall(index) {
    return !!layout[index][3].wall;
  },

  isOdd(index) {
    return this.loopIndex(index) % 2 === 0;
  },

  getType(index) {
    return layout[index][3].type;
  },

  insideMegaGrid(index) {
    return !layout[index][3].megagrid;
  },

  getRoom(index) {
    return layout[index];
  },

  roomCount: layout.length,
};
