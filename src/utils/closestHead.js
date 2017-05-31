import * as THREE from '../lib/three';
import viewer from '../viewer';
import settings from '../settings';
import windowSize from '../utils/windowSize';
import * as serializer from '../utils/serializer';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const camera = viewer.cameras.orthographic;

export default (screenX, screenY, rooms) => {
  mouse.x = ((screenX / windowSize.width) * 2) - 1;
  mouse.y = ((screenY / windowSize.height) * -2) + 1;
  raycaster.setFromCamera(mouse, camera);
  const { ray } = raycaster;
  let roomIndex;
  let headIndex;
  let closestDistance = Number.MAX_VALUE;

  for (let i = 0; i < rooms.length; i++) {
    const { frames, position } = rooms[i];
    const frame = frames[i];
    for (let j = 0, l = serializer.count(frame); j < l; j++) {
      const head = serializer.getPosition(frame, j, 0, position);
      head.z -= settings.roomOffset;
      head.z *= -1;
      const distance = ray.distanceSqToPoint(head);
      if (distance < closestDistance && distance) {
        roomIndex = i;
        headIndex = j;
        closestDistance = distance;
      }
    }
  }
  return [roomIndex, headIndex];
};
