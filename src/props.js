import asyncMap from 'async/map';
import emitter from 'mitt';

import * as THREE from './lib/three';

import roomUrl from './public/models/obj/space-bigger-holes.obj';
import isometricRoomUrl from './public/models/obj/space-isometric.obj';
import settings from './settings';

require('./lib/OBJLoader')(THREE);

const {
  OBJLoader,
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
  ConeBufferGeometry,
  CylinderBufferGeometry,
  SphereGeometry,
  GridHelper,
  Object3D,
} = THREE;

const color = '#ff0000';

const loadObject = (url, callback) => {
  new OBJLoader().load(url,
    object => callback(null, object.children[0]),
    () => {},
    (err) => { callback(err); },
  );
};

const props = Object.assign(emitter(), {
  hand: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderBufferGeometry(radius, radius, height, segments),
      new MeshLambertMaterial({ color }),
    );

    cylinder.rotation.x = Math.PI * 0.5 * 7;
    cylinder.updateMatrix();
    cylinder.geometry.applyMatrix(cylinder.matrix);
    return cylinder;
  }()),

  controller: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderBufferGeometry(radius, radius, height, segments),
      new MeshLambertMaterial({ color }),
    );
    const group = new Object3D();
    cylinder.rotation.x = Math.PI * 0.5 * 7;
    cylinder.updateMatrix();
    group.add(cylinder);
    return group;
  }()),

  head: (function createHead() {
    const radius = 0.12;
    const height = 0.2;
    const segments = 32;
    const cone = new Mesh(
      new ConeBufferGeometry(radius, height, segments),
      new MeshLambertMaterial({ color }),
    );

    cone.rotation.x = Math.PI * 0.5 * 7;
    cone.updateMatrix();
    cone.geometry.applyMatrix(cone.matrix);
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
    return new Mesh(geometry, material);
  }()),

  grid: (function createGrid() {
    return new GridHelper(50, 50, 0xaaaa00, 0xaaaa00);
  }()),
});

asyncMap(
  [roomUrl, isometricRoomUrl],
  loadObject,
  (error, [room, isometricRoom]) => {
    if (error) throw error;
    props.room = room;
    props.orthographicRoom = isometricRoom;
    props.emit('loaded');
  },
);

export default props;
