import { Color } from 'three';

const pairs = ([
  [0x55b848, 0xef4f36],
  [0xe9ad21, 0xcc44b9],
  [0x40a598, 0xef4f36],
  [0xc95fbf, 0xe9ad21],
  [0xef4f36, 0x40a598],
  [0x55b848, 0xcc44b9],
  [0xe9ad21, 0x40a598],
  [0xc95fbf, 0x55b848],
  [0x40a598, 0xe9ad21],
  [0x55b848, 0xef4f36],
  [0xc95fbf, 0x40a598],
  [0xef4f36, 0xe9ad21],
]).map(pair => pair.map(color => new Color(color)));

const pairCount = pairs.length;

export const getRoomColor = roomIndex => pairs[roomIndex % pairCount][0];
export const getCostumeColor = roomIndex => pairs[roomIndex % pairCount][1];
