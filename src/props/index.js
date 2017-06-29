import * as THREE from '../lib/three';
import { loadModel } from '../utils/three';
import settings from '../settings';

import { recordCostumeColor, orbColor, textColor } from '../theme/colors';

import wallUrl from './models/first-wall.obj';
import roomUrl from './models/space-bigger-holes.obj';
import isometricWallUrl from './models/first-wall-isometric.obj';
import isometricRoomUrl from './models/space-isometric.obj';
import roomTextureUrl from './models/bake/VR_AOMap.png';
import isometricRoomTextureUrl from './models/bake/ISO_AOMap.png';

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
  perspectiveWall: [wallUrl],
  perspectiveRoom: [roomUrl, roomTextureUrl],
  orthographicWall: [isometricWallUrl],
  orthographicRoom: [isometricRoomUrl, isometricRoomTextureUrl],
  hand: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderBufferGeometry(radius, radius, height, segments),
      new MeshLambertMaterial(),
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
    const thumbpadHeight = 0.0225;
    const thumbpad = new THREE.Mesh(
      new CylinderBufferGeometry(thumbpadRadius, thumbpadRadius, thumbpadHeight, segments),
      new MeshLambertMaterial({ color: textColor.getHex() })
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
      new MeshLambertMaterial(),
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
      color: orbColor.clone(),
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
