import * as THREE from '../lib/three';
import viewer from '../viewer';
import windowSize from '../utils/windowSize';
import * as serializer from '../utils/serializer';
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
    for (let j = 0, l = room.countPerformances(); j < l; j++) {
      const head = room.getHeadPosition(j);
      const distance = distanceToMouse(head);
      if (
        distance < closestDistance &&
        distance < MIN_HEAD_DISTANCE &&
        distance
      ) {
        roomIndex = i;
        headIndex = j;
        closestDistance = distance;
      }
    }
  }
  CLOSEST_ARRAY[0] = roomIndex;
  CLOSEST_ARRAY[1] = headIndex;
  return CLOSEST_ARRAY;
};
