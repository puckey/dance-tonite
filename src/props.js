import * as THREE from './lib/three';
import { loadModel } from './utils/three';
import settings from './settings';
import { recordCostumeColor } from './theme/colors';

import wallUrl from './public/models/obj/first-wall.obj';
import roomUrl from './public/models/obj/space-bigger-holes.obj';
import isometricWallUrl from './public/models/obj/new-rooms/first-wall.obj';
import isometricHorizontalRoomUrl from './public/models/obj/new-rooms/horizontal-room.obj';
import isometricVerticalRoomUrl from './public/models/obj/new-rooms/vertical-room.obj';
import isometricHorizontalVerticalCornerUrl from './public/models/obj/new-rooms/horizontal-vertical-corner.obj';
import isometricVerticalHorizontalCornerUrl from './public/models/obj/new-rooms/vertical-horizontal-corner.obj';
import roomTextureUrl from './public/models/obj/bake/VR_AOMap.png';
import isometricRoomTextureUrl from './public/models/obj/bake/ISO_AOMap.png';

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
  room: [roomUrl, roomTextureUrl],
  wall: [wallUrl],
  orthographicWall: [isometricWallUrl],
  orthographicRoom: [
    isometricHorizontalRoomUrl,
    // Commented out isometric texture, because it doesn't work with new model:
    // isometricRoomTextureUrl
  ],
  orthographicVerticalRoom: [isometricVerticalRoomUrl],
  orthographicHorizontalVerticalCorner: [isometricHorizontalVerticalCornerUrl],
  orthographicVerticalHorizontalCorner: [isometricVerticalHorizontalCornerUrl],
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
      color: settings.sphereColor.clone(),
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
