import * as THREE from '../lib/three';

import { queryData } from '../utils/url';
import props from '../props';
import {
  tempVector,
  createInstancedMesh,
  setIdentityMatrix,
  set180RotationMatrix,
} from '../utils/three';
import viewer from '../viewer';
import settings from '../settings';
import {
  getCostumeColor,
  getRoomColor,
  recordCostumeColor,
  recordRoomColor,
  highlightColor,
} from '../theme/colors';
import streamJSON from '../lib/stream-json';
import * as roomUtils from './utils';
import layout from './layout';
import dummyTextureUrl from '../public/dummy.png';
import audio from '../audio';
import * as serializer from '../utils/serializer';
import feature from '../utils/feature';

const PROTOCOL = location.protocol;

let roomIndex = 0;
let wallMesh;
let wallMeshes;
let roomMesh;
let floorMesh;
let roomVerticalMesh;
let horizontalVerticalCornerMesh;
let verticalHorizontalCornerMesh;
let roomMeshes;
let floorMeshes;
let roomVerticalMeshes;
let horizontalVerticalCornerMeshes;
let verticalHorizontalCornerMeshes;
let headMesh;
let handMesh;

let meshesByType;

const roomOffset = new THREE.Vector3(0, settings.roomHeight * 0.5, 0);
const roomsGroup = new THREE.Group();
roomsGroup.matrixAutoUpdate = false;

const debugMesh = new THREE.Mesh(
  new THREE.BoxGeometry(0, 0, 0),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(dummyTextureUrl),
  })
);
debugMesh.frustumCulled = false;

const getFrame = (frames, number) => {
  let frame = frames[number];
  if (!frame) frame--;
  // Check if data is still a string:
  if (frame[0] === '[') {
    frame = frames[number] = JSON.parse(frame);
  }
  return frame;
};

export default class Room {
  constructor({ url, recording, index, pathRecording }) {
    this._worldPosition = new THREE.Vector3();
    const placementIndex = this.placementIndex = index === undefined
      ? roomIndex
      : index;
    this.index = roomIndex;
    roomIndex += 1;

    this.isRecording = !!recording;
    this.url = url;
    this.pathRecording = pathRecording;
    this.fps = 90;
    if (recording) {
      this.hideHead = recording.hideHead;
      this.frames = recording.frames;
      this.changeColor(recordRoomColor);
    }

    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.placementIndex);
    this.position = layout.getPosition(
      placementIndex,
      new THREE.Vector3(),
      !!recording
    );
    this.updatePosition();
    this.costumeColor = this.isRecording
      ? recordCostumeColor
      : getCostumeColor(this.index);
  }

  load(callback) {
    const frames = [];
    this.streamer = streamJSON(
      `${PROTOCOL}//d1nylz9ljdxzkb.cloudfront.net/${
        this.pathRecording
          ? ''
          : `${queryData.fps || (feature.has6DOF ? 45 : 15)}FPS/`
      }${this.url}`,
      (error, json) => {
        if (error || !json) {
          if (callback) {
            return callback(error);
          }
        }
        if (!this.frames) {
          // First JSON is meta object:
          const meta = JSON.parse(json);
          this.frames = frames;
          this.hideHead = meta.hideHead;
          this.performanceCount = meta.count;
          if (meta.fps) {
            this.fps = meta.fps;
          }
        } else {
          frames.push(json);
        }
      }
    );
  }

  updatePosition() {
    const position = tempVector()
      .add(this.position)
      .add(roomOffset);
    position.y -= 1;
    const type = layout.getType(this.placementIndex);
    if (type === 'PLANE') return;
    const meshes = meshesByType[type] || meshesByType.HORIZONTAL;
    const color = getRoomColor(this.placementIndex);
    for (const i in meshes) {
      let mesh = meshes[i];
      let index = mesh.geometry.maxInstancedCount++;
      mesh.setPositionAt(index, position);
      mesh.setColorAt(index, color);
      mesh.needsUpdate();

      mesh = wallMeshes[i];
      if (layout.hasWall(this.placementIndex)) {
        index = mesh.geometry.maxInstancedCount++;
        mesh.setPositionAt(index, position);
        mesh.setColorAt(index, color);
        mesh.needsUpdate();
      }
    }
  }

  get worldPosition() {
    return this._worldPosition
      .copy(this.position)
      .applyMatrix4(roomsGroup.matrix);
  }

  isHighlighted(performance) {
    return Room.highlight.roomIndex === this.index
      && Room.highlight.performanceIndex === performance;
  }

  changeColor(color) {
    for (const i in roomMeshes) {
      const mesh = roomMeshes[i];
      mesh.setColorAt(this.index, color);
      mesh.needsUpdate('color');

      const wall = wallMeshes[i];
      wall.setColorAt(this.index, color);
      wall.needsUpdate('color');
    }
  }

  getHeadPosition(index, applyMatrix = true) {
    const position = serializer.avgPosition(
      this.lowerFrame,
      this.higherFrame,
      this.frameRatio,
      index,
      0,
      this.position
    );
    if (applyMatrix) {
      position.applyMatrix4(roomsGroup.matrix);
    }
    return position;
  }

  getHeadOrientation(index) {
    return serializer.avgQuaternion(
      this.lowerFrame,
      this.higherFrame,
      this.frameRatio,
      index,
      0
    );
  }

  transformToHead(object, layerIndex) {
    object.position.copy(this.getHeadPosition(layerIndex, false));
    object.quaternion.copy(this.getHeadOrientation(layerIndex));
  }

  get frame() {
    return this.frameNumber === undefined
      ? null
      : this.frames[Math.floor(this.frameNumber)];
  }

  secondsToFrame(seconds) {
    return (seconds % (audio.loopDuration * 2)) * this.fps;
  }

  gotoTime(seconds, maxLayers) {
    const { frames } = this;
    if (!frames) return;
    const hidden = !layout.isMainTimeline(this.index) && audio.progress < 23;
    const frameNumber = this.frameNumber = this.secondsToFrame(seconds);
    const lower = hidden ? 0 : Math.floor(frameNumber);
    const higher = hidden ? 0 : Math.ceil(frameNumber);
    if (frames.length <= lower) return;
    const lowerFrame = this.lowerFrame = getFrame(frames, lower);
    const higherFrame = this.higherFrame = getFrame(frames, higher);
    const ratio = hidden ? 0 : this.frameRatio = frameNumber % 1;
    if (maxLayers !== undefined) {
      this.performanceCount = Math.min(maxLayers, serializer.count(lowerFrame));
    } else if (!this.performanceCount) {
      this.performanceCount = serializer.count(lowerFrame);
    }

    // In orthographic mode, scale up the meshes:
    const scale = roomMesh === roomMeshes.orthographic ? 1.3 : 1;
    // if (hidden && audio.progress < 23) return;

    const { position } = this;
    for (let i = 0; i < this.performanceCount; i++) {
      const color = this.isHighlighted(i) ? highlightColor : this.costumeColor;
      if (!this.hideHead) {
        roomUtils.transformMesh(
          headMesh,
          lowerFrame,
          higherFrame,
          ratio,
          headMesh.geometry.maxInstancedCount++,
          i,
          0, // head
          scale,
          color,
          position,
          hidden
        );
      }
      roomUtils.transformMesh(
        handMesh,
        lowerFrame,
        higherFrame,
        ratio,
        handMesh.geometry.maxInstancedCount++,
        i,
        1, // first hand
        scale,
        color,
        position,
        hidden
      );
      roomUtils.transformMesh(
        handMesh,
        lowerFrame,
        higherFrame,
        ratio,
        handMesh.geometry.maxInstancedCount++,
        i,
        2, // second hand
        scale,
        color,
        position,
        hidden
      );
    }
  }

  destroy() {
    roomsGroup.remove(this.headMesh);
    roomsGroup.remove(this.handMesh);
    if (this.streamer) this.streamer.cancel();
  }
}

Room.clear = () => {
  handMesh.geometry.maxInstancedCount = headMesh.geometry.maxInstancedCount = 0;
};

Room.switchModel = (model) => {
  roomsGroup.remove(wallMesh);
  roomsGroup.remove(roomMesh);
  roomsGroup.remove(roomVerticalMesh);
  roomsGroup.remove(horizontalVerticalCornerMesh);
  roomsGroup.remove(verticalHorizontalCornerMesh);
  roomsGroup.remove(floorMesh);

  wallMesh = wallMeshes[model];
  roomMesh = roomMeshes[model];
  floorMesh = floorMeshes[model];
  roomVerticalMesh = roomVerticalMeshes[model];
  horizontalVerticalCornerMesh = horizontalVerticalCornerMeshes[model];
  verticalHorizontalCornerMesh = verticalHorizontalCornerMeshes[model];

  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
  roomsGroup.add(roomVerticalMesh);
  roomsGroup.add(horizontalVerticalCornerMesh);
  roomsGroup.add(verticalHorizontalCornerMesh);
  roomsGroup.add(floorMesh);
};

Room.reset = ({ showAllWalls } = {}) => {
  Room.setHighlight();
  setIdentityMatrix(roomsGroup);
  if (roomMesh) roomsGroup.remove(roomMesh);
  if (wallMesh) roomsGroup.remove(wallMesh);
  if (headMesh) roomsGroup.remove(headMesh);
  if (handMesh) roomsGroup.remove(handMesh);

  roomIndex = 0;
  wallMeshes = {
    default: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.wall.geometry,
      color: getRoomColor,
      material: props.wall.material,
    }),
    orthographic: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.orthographicWall.geometry,
      color: getRoomColor,
      material: props.orthographicWall.material,
    }),
  };
  roomMeshes = {
    default: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.room.geometry,
      color: getRoomColor,
      material: props.room.material,
    }),
    orthographic: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.orthographicRoom.geometry,
      color: getRoomColor,
      material: props.orthographicRoom.material,
    }),
  };
  floorMeshes = {
    default: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.floor.geometry,
      color: getRoomColor,
      material: props.floor.material,
    }),
    orthographic: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.floor.geometry,
      color: getRoomColor,
      material: props.floor.material,
    }),
  };
  roomVerticalMeshes = {
    default: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.verticalRoom.geometry,
      color: getRoomColor,
      material: props.verticalRoom.material,
    }),
    orthographic: createInstancedMesh({
      count: layout.roomCount,
      geometry: props.orthographicVerticalRoom.geometry,
      color: getRoomColor,
      material: props.orthographicVerticalRoom.material,
    }),
  };
  horizontalVerticalCornerMeshes = {
    default: createInstancedMesh({
      count: 1,
      geometry: props.horizontalVerticalCorner.geometry,
      color: getRoomColor,
      material: props.horizontalVerticalCorner.material,
    }),
    orthographic: createInstancedMesh({
      count: 1,
      geometry: props.orthographicHorizontalVerticalCorner.geometry,
      color: getRoomColor,
      material: props.orthographicHorizontalVerticalCorner.material,
    }),
  };
  verticalHorizontalCornerMeshes = {
    default: createInstancedMesh({
      count: 1,
      geometry: props.verticalHorizontalCorner.geometry,
      color: getRoomColor,
      material: props.verticalHorizontalCorner.material,
    }),
    orthographic: createInstancedMesh({
      count: 1,
      geometry: props.orthographicVerticalHorizontalCorner.geometry,
      color: getRoomColor,
      material: props.orthographicVerticalHorizontalCorner.material,
    }),
  };
  [
    horizontalVerticalCornerMeshes,
    verticalHorizontalCornerMeshes,
    roomVerticalMeshes,
    floorMeshes,
    roomMeshes,
    wallMeshes,
  ].forEach(meshes => {
    meshes.default.geometry.maxInstancedCount = 0;
    meshes.orthographic.geometry.maxInstancedCount = 0;
  });

  roomMeshes.default.receiveShadow = true;
  roomMeshes.orthographic.receiveShadow = true;

  wallMesh = wallMeshes.default;
  roomMesh = roomMeshes.default;
  floorMesh = floorMeshes.default;
  roomVerticalMesh = roomMeshes.default;

  headMesh = createInstancedMesh({
    count: layout.roomCount * 10,
    geometry: props.head.geometry,
  });
  headMesh.geometry.maxInstancedCount = 0;

  handMesh = createInstancedMesh({
    count: layout.roomCount * 10 * 2,
    geometry: props.hand.geometry,
  });
  handMesh.geometry.maxInstancedCount = 0;

  meshesByType = {
    HORIZONTAL: roomMeshes,
    VERTICAL: roomVerticalMeshes,
    HORIZONTAL_CORNER: horizontalVerticalCornerMeshes,
    VERTICAL_CORNER: verticalHorizontalCornerMeshes,
    PLANE: floorMeshes,
  };

  roomsGroup.add(headMesh);
  roomsGroup.add(handMesh);
  roomsGroup.add(wallMesh);
  roomsGroup.add(roomMesh);
  viewer.scene.add(roomsGroup);

  // Move an extra invisible object3d with a texture to the end of scene's children
  // array in order to solve a texture glitch as described in:
  // https://github.com/puckey/you-move-me/issues/129
  viewer.scene.add(debugMesh);
};

Room.rotate180 = () => {
  set180RotationMatrix(roomsGroup);
};

Room.group = roomsGroup;

Room.highlight = {};

Room.setHighlight = ([room, performance] = []) => {
  Room.highlight.roomIndex = room;
  Room.highlight.performanceIndex = performance;
};
