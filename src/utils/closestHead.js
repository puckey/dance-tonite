import * as THREE from '../lib/three';
import viewer from '../viewer';
import windowSize from '../utils/windowSize';
import { worldToScreen } from '../utils/three';

const mouse = new THREE.Vector2();
const VECTOR2 = new THREE.Vector2();

const distanceToMouse = (worldPosition) => VECTOR2
  .copy(worldToScreen(viewer.camera, worldPosition))
  .distanceToSquared(mouse);

const MIN_HEAD_DISTANCE = 100 * 100;

const CLOSEST_ARRAY = [];
export default (screenX, screenY, rooms) => {
  if (screenX === undefined) return;

  mouse.set(screenX, screenY);
  let roomIndex;
  let headIndex;
  let closestDistance = Number.MAX_VALUE;

  const minRoomDistance = (windowSize.width * windowSize.width) * 0.5;
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const roomDistance = distanceToMouse(room.worldPosition);
    if (roomDistance > minRoomDistance) continue;
    for (let j = 0, l = room.frame.count; j < l; j++) {
      if (room.frames.hideHead === false) {
        const distance = distanceToMouse(room.getHeadPosition(j));
        if (distance < closestDistance && distance < MIN_HEAD_DISTANCE) {
          roomIndex = i;
          headIndex = j;
          closestDistance = distance;
        }
      }
      const rdistance = distanceToMouse(room.getRHandPosition(j));
      if (rdistance < closestDistance && rdistance < MIN_HEAD_DISTANCE) {
        roomIndex = i;
        headIndex = j;
        closestDistance = rdistance;
      }
      const ldistance = distanceToMouse(room.getLHandPosition(j));
      if (ldistance < closestDistance && ldistance < MIN_HEAD_DISTANCE) {
        roomIndex = i;
        headIndex = j;
        closestDistance = ldistance;
      }
    }
  }
  CLOSEST_ARRAY[0] = roomIndex;
  CLOSEST_ARRAY[1] = headIndex;
  return CLOSEST_ARRAY;
};

const distanceCheck = (distance, closestDistance) => (
  distance < closestDistance &&
  distance < MIN_HEAD_DISTANCE
);
