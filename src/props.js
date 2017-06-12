import * as THREE from './lib/three';
import { loadModel } from './utils/three';
import settings from './settings';
import { recordCostumeColor, highlightColor } from './theme/colors';

import wallUrl from './public/models/obj/new-rooms/vr/first-wall.obj';

import roomUrl from './public/models/obj/new-rooms/vr/horizontal-room.obj';
import roomTextureUrl from './public/models/obj/new-rooms/vr/bake/horizontal-room-AOMap.jpg';

import verticalRoomUrl from './public/models/obj/new-rooms/vr/vertical-room.obj';
import verticalRoomTextureUrl from './public/models/obj/new-rooms/vr/bake/vertical-room-AOMap.jpg';

import horizontalVerticalCornerUrl from './public/models/obj/new-rooms/vr/horizontal-vertical-corner.obj';
import horizontalVerticalCornerTextureUrl from './public/models/obj/new-rooms/vr/bake/horizontal-vertical-corner-AOMap.jpg';

import verticalHorizontalCornerUrl from './public/models/obj/new-rooms/vr/vertical-horizontal-corner.obj';
import verticalHorizontalCornerTextureUrl from './public/models/obj/new-rooms/vr/bake/vertical-horizontal-corner-AOMap.jpg';

import floorUrl from './public/models/obj/new-rooms/floor.obj';


import isoWallUrl from './public/models/obj/new-rooms/first-wall.obj';

import isoHorizontalRoomUrl from './public/models/obj/new-rooms/horizontal-room.obj';
import isoHorizontalRoomTextureUrl from './public/models/obj/new-rooms/bake/horizontal-room-AOMap.jpg';

import isoVerticalRoomUrl from './public/models/obj/new-rooms/vertical-room.obj';
import isoVerticalRoomTextureUrl from './public/models/obj/new-rooms/bake/vertical-room-AOMap.jpg';

import isoHorizontalVerticalCornerUrl from './public/models/obj/new-rooms/horizontal-vertical-corner.obj';
import isoHorizontalVerticalCornerTextureUrl from './public/models/obj/new-rooms/bake/horizontal-vertical-corner-AOMap.jpg';

import isoVerticalHorizontalCornerUrl from './public/models/obj/new-rooms/vertical-horizontal-corner.obj';
import isoVerticalHorizontalCornerTextureUrl from './public/models/obj/new-rooms/bake/vertical-horizontal-corner-AOMap.jpg';

const {
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
  ConeBufferGeometry,
  CylinderBufferGeometry,
  SphereGeometry,
  GridHelper,
  Group,
} = THREE;

const controllerMaterial = new MeshLambertMaterial({ color: recordCostumeColor });

const props = {
  room: [
    roomUrl,
    roomTextureUrl,
  ],
  verticalRoom: [
    verticalRoomUrl,
    verticalRoomTextureUrl,
  ],
  floor: [floorUrl],
  horizontalVerticalCorner: [
    horizontalVerticalCornerUrl,
    horizontalVerticalCornerTextureUrl,
  ],
  verticalHorizontalCorner: [
    verticalHorizontalCornerUrl,
    verticalHorizontalCornerTextureUrl,
  ],
  wall: [wallUrl],
  orthographicWall: [isoWallUrl],
  orthographicRoom: [
    isoHorizontalRoomUrl,
    isoHorizontalRoomTextureUrl,
  ],
  orthographicVerticalRoom: [
    isoVerticalRoomUrl,
    isoVerticalRoomTextureUrl,
  ],
  orthographicHorizontalVerticalCorner: [
    isoHorizontalVerticalCornerUrl,
    isoHorizontalVerticalCornerTextureUrl,
  ],
  orthographicVerticalHorizontalCorner: [
    isoVerticalHorizontalCornerUrl,
    isoVerticalHorizontalCornerTextureUrl,
  ],
  hand: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderBufferGeometry(radius, radius, height, segments),
      new MeshLambertMaterial({ color: recordCostumeColor }),
    );

    cylinder.rotation.x = Math.PI * 0.5 * 7;
    cylinder.updateMatrix();
    cylinder.geometry.applyMatrix(cylinder.matrix);
    cylinder.castShadow = true;
    return cylinder;
  }()),

  controller: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderBufferGeometry(radius, radius, height, segments),
      controllerMaterial,
    );
    cylinder.rotation.x = Math.PI * 0.5 * 7;
    cylinder.updateMatrix();

    const thumbpadRadius = 0.015;
    const thumbpadHeight = 0.02;
    const thumbpad = new THREE.Mesh(
      new CylinderBufferGeometry(thumbpadRadius, thumbpadRadius, thumbpadHeight, segments),
      new MeshLambertMaterial({ color: settings.textColor })
    );
    thumbpad.name = 'button';
    thumbpad.position.z = -0.05;
    thumbpad.position.y = 0.01;
    thumbpad.updateMatrix();

    const group = new Group();

    group.add(cylinder, thumbpad);

    return group;
  }()),

  head: (function createHead() {
    const radius = 0.12;
    const height = 0.2;
    const segments = 32;
    const cone = new Mesh(
      new ConeBufferGeometry(radius, height, segments),
      new MeshLambertMaterial({ color: recordCostumeColor }),
    );

    cone.rotation.x = Math.PI * 0.5 * 7;
    cone.updateMatrix();
    cone.geometry.applyMatrix(cone.matrix);
    cone.castShadow = true;
    return cone;
  }()),

  sphere: (function createSphere() {
    const segments = 32;
    const geometry = new SphereGeometry(
      settings.sphereRadius,
      segments,
      segments,
    );
    const material = new MeshBasicMaterial({
      color: highlightColor.clone(),
    });
    const mesh = new Mesh(geometry, material);
    return mesh;
  }()),

  grid: (function createGrid() {
    return new GridHelper(50, 50, 0xaaaa00, 0xaaaa00);
  }()),

  prepare: () => Promise.all(
    Object.keys(props)
      .filter(id => Array.isArray(props[id]))
      .map(
        (id) => loadModel(props[id])
          .then((model) => {
            props[id] = model;
          })
      )
  ),
};

export default props;
