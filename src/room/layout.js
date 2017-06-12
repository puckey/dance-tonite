import settings from '../settings';
import { tempVector } from '../utils/three';

const { roomWidth, roomHeight, roomDepth, roomOffset } = settings;
const ph = { type: 'PLANE', timeline: false };
const pl = { type: 'PLANE' };
const em = { type: 'EMPTY' };
const ve = { type: 'VERTICAL' };
const ho = { type: 'HORIZONTAL' };
const hw = { type: 'HORIZONTAL', wall: true };
const vc = { type: 'VERTICAL_CORNER' };
const hc = { type: 'HORIZONTAL_CORNER' };

const s = 1 / 6;
const py = -4 + s * 2;

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
  [0, 0, 9, hc],
  [0, -1 + s, 9, ve],
  [0, -2 + s, 9, ve],
  [0, -3 + s, 9, ve],
  [0, py, 9, vc],
                                      [0, py, 10, pl],
                    [-1, py, 11, ph], [0, py, 11, pl], [1, py, 11, ph],
  [-2, py, 12, ph], [-1, py, 12, ph], [0, py, 12, pl], [1, py, 12, ph], [2, py, 12, ph],
  [-2, py, 13, ph], [-1, py, 13, ph], [0, py, 13, pl], [1, py, 13, ph], [2, py, 13, ph],
                    [-1, py, 14, ph], [0, py, 14, pl], [1, py, 14, ph],
  [0, py, 15, hw],
  [0, py, 16, ho],
  [0, py, 17, ho],
  [0, py, 18, ho],
  [0, py, 19, ho],
];

const layout = rooms.filter(([,,, { type }]) => type !== 'EMPTY');

const timelineLayout = rooms.filter(([,,, { timeline }]) => timeline !== false);

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

  getRoom(index) {
    return layout[index];
  },

  roomCount: layout.length,
};
