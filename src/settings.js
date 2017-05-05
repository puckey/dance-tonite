import { Color } from './lib/three';

export default {
  // Room dimensions:
  roomDepth: 6,
  roomHeight: 4,
  roomWidth: 4,

  // The amount to offset the recording within the room:
  roomOffset: -0.2 * 6,

  // Room holes:
  holeHeight: 1.6,
  holeRadius: 0.18,

  // Yellow orb:
  sphereRadius: 0.18 * 0.9,
  sphereColor: new Color(1, 1, 0),

  // The amount of loops that can be recorded:
  loopCount: 21,

  // The total amount of loops contained in the playback file:
  totalLoopCount: 26,
  textColor: '#ffff07',
};
