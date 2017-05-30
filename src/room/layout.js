import settings from '../settings';
import { tempVector } from '../utils/three';

const rooms = [
  [0, 0, -3, 'EMPTY'],
  [0, 0, -2, 'EMPTY'],
  [0, 0, -1, 'EMPTY'],
  [0, 0, 0],
  [0, 0, 1],
  [0, 0, 2],
  [0, 0, 3],
  [0, 0, 4],
  [0, 0, 5],
  [0, 0, 6],
  [0, 0, 7, 'HORIZONTAL_CORNER'],
  [0, -1, 7, 'VERTICAL'],
  [0, -2, 7, 'VERTICAL'],
  [0, -3, 7, 'VERTICAL'],
  [0, -4, 7, 'VERTICAL_CORNER'],
  [0, -4, 8],
  [0, -4, 9],
                               [-1, -4, 10, 'PLANE', true], [0, -4, 10, 'PLANE'], [1, -4, 10, 'PLANE', true],
  [-2, -4, 11, 'PLANE', true], [-1, -4, 11, 'PLANE', true], [0, -4, 11, 'PLANE'], [1, -4, 11, 'PLANE', true], [2, -4, 11, 'PLANE', true],
  [-2, -4, 12, 'PLANE', true], [-1, -4, 12, 'PLANE', true], [0, -4, 12, 'PLANE'], [1, -4, 12, 'PLANE', true], [2, -4, 12, 'PLANE', true],
  [-2, -4, 13, 'PLANE', true], [-1, -4, 13, 'PLANE', true], [0, -4, 13, 'PLANE'], [1, -4, 13, 'PLANE', true], [2, -4, 13, 'PLANE', true],
                               [-1, -4, 14, 'PLANE', true], [0, -4, 14, 'PLANE'], [1, -4, 14, 'PLANE', true],
  [0, -4, 15],
  [0, -4, 16],
  [0, -4, 17],
  [0, -4, 18],
  [0, -4, 19],
  [0, -4, 20],
  [0, -4, 21],
  [0, -4, 22],
];

const layout = rooms.filter(([,,, type]) => type !== 'EMPTY');

const timelineLayout = rooms.filter(([,,,, ignore]) => !ignore);

export default {
  getPosition(position, roomPosition, reviewMode) {
    let x = 0;
    let y = 0;
    let z = 0;
    if (reviewMode) {
      z = position * settings.roomDepth + settings.roomOffset;
    } else {
      const lower = Math.floor(position);
      const higher = Math.ceil(position);
      const ratio = position % 1;
      const roomsLayout = roomPosition ? layout : timelineLayout;
      const [x1, y1, z1] = roomsLayout[lower];
      const [x2, y2, z2] = roomsLayout[higher];
      x = (x1 + (x2 - x1) * ratio) * settings.roomWidth;
      y = (y1 + (y2 - y1) * ratio) * settings.roomHeight;
      z = (z1 + (z2 - z1) * ratio) * (settings.roomDepth + 0.0001) + settings.roomOffset;
    }
    return roomPosition
      ? roomPosition.set(x, y, z)
      : tempVector(x, y, z);
  },

  getModel(index) {
    return layout[index][3] || 'HORIZONTAL';
  },

  getRoom(index) {
    return layout[index];
  },

  roomCount: layout.length,
};
