import { Color } from '../lib/three';
import { queryData } from '../utils/url';

const green = new Color(0x55b848);
const red = new Color(0xef4f36);
const orange = new Color(0xe9ad21);
const purple = new Color(0xcc44b9);
const teal = new Color(0x40a598);
const pink = new Color(0xc95fbf);

const pairs = ([
  [green, red],
  [orange, purple],
  [teal, red],
  [pink, orange],
  [red, teal],
  [green, purple],
  [orange, teal],
  [pink, green],
  [teal, orange],
  [green, red],
  [pink, teal],
  [red, orange],
]);

const pairCount = pairs.length;

export const getRoomColor = roomIndex => pairs[roomIndex % pairCount][0];
export const getCostumeColor = roomIndex => pairs[roomIndex % pairCount][1];
export const namedColors = { green, red, orange, purple, teal, pink };

const pairColor = (color) => pairs.filter(
  ([controllerColor]) => controllerColor === color
)[0][1];

export const recordRoomColor = namedColors[queryData.color] || namedColors.green;
export const recordCostumeColor = queryData.color ? pairColor(recordRoomColor) : namedColors.red;
export const waitRoomColor = new Color(0xcccccc);
