import * as THREE from '../lib/three';
import viewer from '../viewer';
import windowSize from './windowSize';
import { worldToScreen } from './three';

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

  let closestDistance = Number.MAX_VALUE;
  let roomIndex;
  let headIndex;

  const minRoomDistance = (windowSize.width * windowSize.width) * 0.5;
  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i];
    const roomDistance = distanceToMouse(room.worldPosition);
    if (roomDistance > minRoomDistance) continue;
    for (let j = 0, l = room.performanceCount; j < l; j++) {
      if (room.hideHead === false) {
        const head = room.getHeadPosition(j);
        const distance = distanceToMouse(head);
        if (distanceCheck(distance, closestDistance)) {
          roomIndex = i;
          headIndex = j;
          closestDistance = distance;
        }
      } else {
        const rhand = room.getRHandPosition(j);
        const rdistance = distanceToMouse(rhand);
        if (distanceCheck(rdistance, closestDistance)) {
          roomIndex = i;
          headIndex = j;
          closestDistance = rdistance;
          continue;
        }
        const lhand = room.getLHandPosition(j);
        const ldistance = distanceToMouse(lhand);
        if (distanceCheck(ldistance, closestDistance)) {
          roomIndex = i;
          headIndex = j;
          closestDistance = ldistance;
        }
      }
    }
  }
  CLOSEST_ARRAY[0] = roomIndex;
  CLOSEST_ARRAY[1] = headIndex;
  return CLOSEST_ARRAY;
};

function distanceCheck(distance, closestDistance) {
  return (distance < closestDistance &&
          distance < MIN_HEAD_DISTANCE &&
          distance);
}
