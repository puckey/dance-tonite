import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import audio from './audio';
import storage from './storage';
import { getCostumeColor, getRoomColor } from './theme/colors';

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

    this.position.set(
      0,
      0,
      settings.roomOffset + (this.index * (settings.roomDepth + 0.001)),
    );
    this.updatePosition();

    const color = getCostumeColor(this.index);

    this.handMesh = createInstancedMesh({
      count: 30,
      geometry: props.hand.geometry,
      color,
    });
    viewer.scene.add(this.handMesh);

    if (showHead) {
      this.headMesh = createInstancedMesh({
        count: 30,
        geometry: props.head.geometry,
        color,
      });
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

  changeColor(color) {
    for (const i in roomMeshes) {
      const mesh = roomMeshes[i];
      mesh.setColorAt(this.index, color);
      mesh.needsUpdate('color');
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

Room.reset = () => {
  if (roomMesh) viewer.scene.remove(roomMesh);
  roomIndex = 0;
  roomMeshes = {
    default: createInstancedMesh({
      count: num,
      geometry: props.room.geometry,
      color: getRoomColor,
    }),
    orthographic: createInstancedMesh({
      count: num,
      geometry: props.orthographicRoom.geometry,
      color: getRoomColor,
    }),
  };
  roomMesh = roomMeshes.default;
  viewer.scene.add(roomMesh);
};

props.on('loaded', Room.reset);
