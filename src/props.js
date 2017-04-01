import asyncMap from 'async/map';

import * as THREE from './lib/three';

import roomUrl from './public/models/obj/space-bigger-holes.obj';
import isometricRoomUrl from './public/models/obj/space-isometric.obj';

require('./lib/OBJLoader')(THREE);

const {
  OBJLoader,
  Mesh,
  MeshLambertMaterial,
  ConeBufferGeometry,
  CylinderBufferGeometry,
  Object3D,
  BackSide,
} = THREE;

const color = '#ff0000';

const loadObject = (url, callback) => {
  new OBJLoader().load(url,
    object => callback(null, object.children[0]),
    () => {},
    (err) => { callback(err); },
  );
};

const props = {
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

  prepare: (callback) => {
    asyncMap(
      [roomUrl, isometricRoomUrl],
      loadObject,
      (error, [room, isometricRoom]) => {
        if (error) return callback(error);
        props.room = room;
        props.ortographicRoom = isometricRoom;
        callback();
      },
    );
  },
};

export default props;
