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
  [0, -1, 9, ve],
  [0, -2, 9, ve],
  [0, -3, 9, ve],
  [0, -4, 9, vc],
                                      [0, -4, 10, pl],
                    [-1, -4, 11, ph], [0, -4, 11, pl], [1, -4, 11, ph],
  [-2, -4, 12, ph], [-1, -4, 12, ph], [0, -4, 12, pl], [1, -4, 12, ph], [2, -4, 12, ph],
  [-2, -4, 13, ph], [-1, -4, 13, ph], [0, -4, 13, pl], [1, -4, 13, ph], [2, -4, 13, ph],
                    [-1, -4, 14, ph], [0, -4, 14, pl], [1, -4, 14, ph],
  [0, -4, 15, hw],
  [0, -4, 16, ho],
  [0, -4, 17, ho],
  [0, -4, 18, ho],
  [0, -4, 19, ho],
];

const layout = rooms.filter(([,,, { type }]) => type !== 'EMPTY');

const timelineLayout = rooms.filter(([,,, { timeline }]) => timeline !== false);
console.log(layout.length, timelineLayout.length);
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

  hasWall(index) {
    return !!layout[index][3].wall;
  },

  getType(index) {
    return layout[index][3].type;
  },

  getRoom(index) {
    return layout[index];
  },

  roomCount: layout.length,
};
