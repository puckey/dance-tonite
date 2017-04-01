import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import storage from './storage';
import { getCostumeColor } from './theme/colors';

const num = 20;
let roomIndex = 0;
let roomMesh;

export default class Room {
  constructor(url) {
    this.index = roomIndex;
    roomIndex += 1;
    this.url = url;
    this.position = new THREE.Vector3();

    const costumeColor = getCostumeColor(this.index);

    if (!roomMesh) {
      roomMesh = createInstancedMesh(
        num,
        getCostumeColor(0),
        props.space.geometry,
      );
      viewer.scene.add(roomMesh);
    }

    this.setPosition(0,
      settings.roomHeight * 0.5,
      settings.roomOffset + (this.index * (settings.roomDepth + 0.001)),
    );

    this.handMesh = createInstancedMesh(
      200,
      costumeColor,
      props.hand.geometry,
    );
    viewer.scene.add(this.handMesh);


    this.headMesh = createInstancedMesh(
      200,
      costumeColor,
      props.head.geometry,
    );
    viewer.scene.add(this.headMesh);
  }

  load(callback) {
    storage.load(this.url, (error, performances) => {
      if (error) return callback(error);
      this.performances = performances;
      callback();
    });
  }

  setPosition(x, y, z) {
    const position = this.position;
    position.x = x;
    position.y = y;
    position.z = z;
    roomMesh.setPositionAt(this.index, tempVector(x, y, z));
    roomMesh.needsUpdate('position');
  }

  moveMesh(instancedMesh, index, [x, y, z, qx, qy, qz, qw]) {
    instancedMesh.setQuaternionAt(index, tempQuaternion(qx, qy, qz, qw));
    instancedMesh.setPositionAt(index, tempVector(x, y, z + this.position.z - settings.roomOffset));
    instancedMesh.needsUpdate();
  }

  gotoTime(time) {
    let seconds = time * 0.001;

    // Offset every other room in time by half a loop, so whenever our floating
    // camera enters the room, we are seeing a recording:
    if (this.index % 2 === 0) {
      seconds += settings.loopSeconds;
    }

    const number = Math.floor((seconds % (settings.loopSeconds * 2)) * 90);

    if (!this.performances) return;
    for (let i = 0; i < this.performances.length; i++) {
      const frames = this.performances[i];
      const [head, left, right] = frames[number % frames.length];
      this.moveMesh(this.headMesh, i, head);
      this.moveMesh(this.handMesh, i * 2, left);
      this.moveMesh(this.handMesh, (i * 2) + 1, right);
    }
  }
}
