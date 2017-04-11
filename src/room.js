import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import audio from './audio';
import storage from './storage';
import { getCostumeColor } from './theme/colors';

const num = 20;
let roomIndex = 0;
let roomMesh;
let roomMeshes;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);

const transformMesh = (
  instancedMesh,
  index,
  [x, y, z, qx, qy, qz, qw],
  scale,
  offset,
) => {
  instancedMesh.setQuaternionAt(index, tempQuaternion(qx, qy, qz, qw));
  instancedMesh.setPositionAt(
    index,
    tempVector(x, y, z - settings.roomOffset).add(offset),
  );
  instancedMesh.setScaleAt(index, tempVector(scale, scale, scale));
  instancedMesh.needsUpdate();
};

props.on('loaded', () => {
  roomMeshes = {
    default: createInstancedMesh(
      num,
      getCostumeColor(0),
      props.room.geometry,
    ),
    orthographic: createInstancedMesh(
      num,
      getCostumeColor(0),
      props.orthographicRoom.geometry,
    ),
  };
  roomMesh = roomMeshes.default;
  viewer.scene.add(roomMesh);
});

export default class Room {
  constructor({ showHead, url, recording } = { showHead: true }) {
    this.index = roomIndex;
    this.showHead = showHead;
    this.url = url;
    if (recording) {
      this.layers = recording.layers;
    }
    roomIndex += 1;
    this.position = new THREE.Vector3();

    const costumeColor = getCostumeColor(this.index);

    this.position.set(
      0,
      0,
      settings.roomOffset + (this.index * (settings.roomDepth + 0.001)),
    );
    this.updatePosition();

    this.handMesh = createInstancedMesh(
      200,
      costumeColor,
      props.hand.geometry,
    );
    viewer.scene.add(this.handMesh);

    if (showHead) {
      this.headMesh = createInstancedMesh(
        200,
        costumeColor,
        props.head.geometry,
      );
      viewer.scene.add(this.headMesh);
    }
  }

  load(callback) {
    storage.load(this.url, (error, layers) => {
      if (error) return callback(error);
      this.layers = layers;
      callback();
    });
  }

  updatePosition() {
    const position = tempVector(0, 0, 0).add(this.position).add(roomOffset);
    for (const i in roomMeshes) {
      roomMeshes[i].setPositionAt(this.index, position);
      roomMeshes[i].needsUpdate('position');
    }
  }

  gotoTime(seconds) {
    const { layers } = this;
    if (!layers) return;

    const frameNumber = Math.floor((seconds % (audio.loopDuration * 2)) * 90);
    // In orthographic mode, scale up the meshes:
    const scale = roomMesh === roomMeshes.orthographic ? 1.3 : 1;
    for (let i = 0; i < layers.length; i++) {
      const frames = layers[i];
      if (frames.length <= frameNumber) continue;
      const [head, left, right] = frames[frameNumber];
      if (this.showHead) {
        transformMesh(this.headMesh, i, head, scale, this.position);
      }
      transformMesh(this.handMesh, i * 2, left, scale, this.position);
      transformMesh(this.handMesh, (i * 2) + 1, right, scale, this.position);
    }
  }

  destroy() {
    viewer.scene.remove(this.headMesh);
    viewer.scene.remove(this.handMesh);
    viewer.scene.remove(roomMesh);
  }
}

Room.switchModel = (model) => {
  viewer.scene.remove(roomMesh);
  roomMesh = roomMeshes[model];
  viewer.scene.add(roomMesh);
};
