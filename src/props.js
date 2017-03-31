import asyncMap from 'async/map';

import * as THREE from './lib/three';

import spaceUrl from './public/models/obj/space-bigger-holes.obj';
import isometricSpaceUrl from './public/models/obj/space-isometric.obj';

require('./lib/OBJLoader')(THREE);

const {
  OBJLoader,
  Mesh,
  MeshLambertMaterial,
  ConeGeometry,
  CylinderGeometry,
  Object3D,
  BackSide,
} = THREE;

const color = '#ff0000';

const loadObject = (url, callback) => {
  const loader = new OBJLoader();
  loader.load(url, (object) => {
    object.traverse((child) => {
      // Colorize meshes:
      if (child.type === 'Mesh') {
        child.material = new MeshLambertMaterial({
          color,
          side: BackSide,
        });
      }
    });
    callback(null, object);
  }, () => {}, (err) => { callback(err); });
};

const props = {
  hand: (function createHand() {
    const radius = 0.02;
    const height = 0.2;
    const segments = 32;
    const cylinder = new Mesh(
      new CylinderGeometry(radius, radius, height, segments),
      new MeshLambertMaterial({ color }),
    );

    cylinder.rotation.x = Math.PI * 0.5 * 7;
    const group = new Object3D();
    group.add(cylinder);
    return group;
  }()),

  head: (function createHead() {
    const radius = 0.12;
    const height = 0.2;
    const segments = 32;
    const cone = new Mesh(
      new ConeGeometry(radius, height, segments),
      new MeshLambertMaterial({ color }),
    );

    cone.rotation.x = Math.PI * 0.5 * 7;
    const group = new Object3D();
    group.add(cone);
    return group;
  }()),

  prepare: (callback) => {
    asyncMap(
      [spaceUrl, isometricSpaceUrl],
      loadObject,
      (error, [space, isometricSpace]) => {
        if (error) return callback(error);
        props.space = space;
        props.isometricSpace = isometricSpace;
        callback();
      },
    );
  },
};

export default props;
