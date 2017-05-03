import emitter from 'mitt';

import * as THREE from './lib/three';

// import roomUrl from './public/models/obj/space-bigger-holes.obj';
import roomUrl from './public/models/obj/space-bigger-holes.obj';
import isometricRoomUrl from './public/models/obj/space-isometric.obj';
import roomTextureUrl from './public/models/obj/bake/VR_AOMap.png';
import isometricRoomTextureUrl from 'public/models/obj/bake/ISO_AOMap.png';
import settings from './settings';
import { recordCostumeColor } from './theme/colors';

require('./lib/OBJLoader')(THREE);

const {
  OBJLoader,
  TextureLoader,
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
  ConeBufferGeometry,
  CylinderBufferGeometry,
  SphereGeometry,
  GridHelper,
  Group,
} = THREE;

const loadObject = (url) => new Promise(
  (resolve, reject) => {
    new OBJLoader().load(url,
      object => resolve(object.children[0]),
      () => {},
      reject,
    );
  }
);

const preloadTexture = (url) => new Promise(
  (resolve, reject) => {
    new TextureLoader().load(
      url,
      resolve,
      () => {},
      reject
    );
  }
);

const controllerMaterial = new MeshLambertMaterial({ color: recordCostumeColor });

const props = Object.assign(emitter(), {
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

  longGrid: (function createGrid() {
    return new GridHelper(500, 500, 0xaaaa00, 0xaaaa00);
  }()),
});

Promise.all([
  loadObject(roomUrl),
  loadObject(isometricRoomUrl), 
  preloadTexture(roomTextureUrl),
  preloadTexture(isometricRoomTextureUrl),
])
  .then(([room, isometricRoom, texture, isometricTexture]) => {
    room.material = new THREE.MeshLambertMaterial();
    room.material.map = texture;

    isometricRoom.material = new THREE.MeshLambertMaterial();
    isometricRoom.material.map = isometricTexture;

    props.room = room;
    props.orthographicRoom = isometricRoom;
    props.emit('loaded');
  })
  .catch((error) => {
    // TODO: goto error screen
    console.log(error);
  });

export default props;
