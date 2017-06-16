import { Color } from '../lib/three';
import layout from '../room/layout';

const green = new Color(0x55b848);
const red = new Color(0xef4f36);
const orange = new Color(0xd19c20);
const purple = new Color(0xcc44b9);
const blue = new Color(0x40a598);
const pink = new Color(0xc95fbf);

const pairs = ([
  [green, red],
  [orange, purple],
  [blue, red],
  [pink, orange],
  [red, blue],
  [green, purple],
  [orange, blue],
  [pink, green],
  [blue, orange],
  [green, red],
  [pink, blue],
  [red, orange],
]);

const pairCount = pairs.length;

const pairByRoomIndex = (roomIndex) => {
  const [x, y, z] = layout.getRoom(roomIndex);
  return pairs[(x + Math.ceil(Math.abs(y)) + z) % pairCount];
};

export const getRoomColor = roomIndex => pairByRoomIndex(roomIndex)[0];
export const getRoomColorByIndex = index => pairs[index % pairs.length][0];

export const getCostumeColor = roomIndex => pairByRoomIndex(roomIndex)[1];
export const namedColors = { green, red, orange, purple, blue, pink };
export const roomColors = { green, red, orange, blue, pink };

const pairColor = (color) => pairs.filter(
  ([controllerColor]) => controllerColor === color
)[0][1];

export const recordRoomColor = namedColors[window.localStorage.getItem('color')] || namedColors.green;
export const recordCostumeColor = window.localStorage.getItem('color') ? pairColor(recordRoomColor) : namedColors.red;
export const waitRoomColor = new Color(0x838181);
export const highlightColor = new Color(0xffff00);
