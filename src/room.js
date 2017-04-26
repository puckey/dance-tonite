import * as THREE from './lib/three';

import props from './props';
import { tempQuaternion, tempVector, createInstancedMesh } from './utils/three';
import viewer from './viewer';
import settings from './settings';
import audio from './audio';
import { getCostumeColor, getRoomColor } from './theme/colors';
import streamJSON from './lib/stream-json';

const PROTOCOL = location.protocol;

const PERFORMANCE_ELEMENT_COUNT = 21;
const LIMB_ELEMENT_COUNT = 7;

const num = 20;
let roomIndex = 0;
let roomMesh;
let roomMeshes;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);

const transformMesh = (
  instancedMesh,
  positions,
  index,
  arrayOffset,
  scale,
  offset,
) => {
  const x = positions[arrayOffset] * 0.0001;
  const y = positions[arrayOffset + 1] * 0.0001;
  const z = positions[arrayOffset + 2] * 0.0001;
  const qx = positions[arrayOffset + 3] * 0.0001;
  const qy = positions[arrayOffset + 4] * 0.0001;
  const qz = positions[arrayOffset + 5] * 0.0001;
  const qw = positions[arrayOffset + 6] * 0.0001;
  instancedMesh.setPositionAt(
    index,
    tempVector(x, y, z - settings.roomOffset).add(offset),
  );
  instancedMesh.setQuaternionAt(index, tempQuaternion(qx, qy, qz, qw));
  instancedMesh.setScaleAt(index, tempVector(scale, scale, scale));
  instancedMesh.needsUpdate();
};

export default class Room {
  constructor({ showHead = true, url, recording }) {
    this.index = roomIndex;
    this.showHead = showHead;
    this.isRecording = !!recording;
    this.url = url;
    roomIndex += 1;
    if (recording) {
      this.frames = recording.frames;
      this.createMeshes();
    }
    this.position = new THREE.Vector3();

    this.position.set(
      0,
      0,
      settings.roomOffset + (this.index * (settings.roomDepth + 0.001)),
    );
    this.updatePosition();
  }

  createMeshes() {
    const color = getCostumeColor(this.index);
    const count = this.isRecording
      ? 20
      : this.layerCount;
    this.handMesh = createInstancedMesh({
      count: count * 2,
      geometry: props.hand.geometry,
      color,
    });
    viewer.scene.add(this.handMesh);

    if (this.showHead) {
      this.headMesh = createInstancedMesh({
        count,
        geometry: props.head.geometry,
        color,
      });
      viewer.scene.add(this.headMesh);
    }
  }

  load(callback) {
    const frames = [];
    streamJSON(`${PROTOCOL}//d1nylz9ljdxzkb.cloudfront.net/${this.url}`,
      (error, json) => {
        if (error || !json) {
          return callback(error);
        }
        if (!this.frames) {
          // First JSON is meta object:
          const meta = JSON.parse(json);
          this.frames = frames;
          this.showHead = !meta.hideHead;
          this.layerCount = meta.count;
          this.createMeshes();
        } else {
          frames.push(json);
        }
      }
    );
  }

  updatePosition() {
    const position = tempVector().add(this.position).add(roomOffset);
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
    const { frames } = this;
    if (!frames) return;

    const frameNumber = Math.floor((seconds % (audio.loopDuration * 2)) * 90);

    if (frames.length <= frameNumber) return;
    let positions = frames[frameNumber];

    // TODO: figure out why we can't use just 'positions.length / PERFORMANCE_ELEMENT_COUNT' here:
    const count = this.layerCount || (positions.length / PERFORMANCE_ELEMENT_COUNT);

    // In orthographic mode, scale up the meshes:
    const scale = roomMesh === roomMeshes.orthographic ? 1.3 : 1;
    if (this.headMesh) {
      this.headMesh.geometry.maxInstancedCount = count;
    }
    this.handMesh.geometry.maxInstancedCount = count * 2;
    // Check if data is still a string:
    if (positions[0] === '[') {
      positions = frames[frameNumber] = JSON.parse(positions);
    }
    for (let i = 0; i < count; i++) {
      if (this.showHead) {
        transformMesh(
          this.headMesh,
          positions,
          i,
          i * PERFORMANCE_ELEMENT_COUNT,
          scale,
          this.position
        );
      }
      transformMesh(
        this.handMesh,
        positions,
        i * 2,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT,
        scale,
        this.position
      );
      transformMesh(
        this.handMesh,
        positions,
        i * 2 + 1,
        i * PERFORMANCE_ELEMENT_COUNT + LIMB_ELEMENT_COUNT * 2,
        scale,
        this.position
      );
    }
  }

  destroy() {
    viewer.scene.remove(this.headMesh);
    viewer.scene.remove(this.handMesh);
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
