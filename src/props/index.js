/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as THREE from '../../third_party/threejs/three';
import { loadModel } from '../utils/three';
import settings from '../settings';
import feature from '../utils/feature';

import { recordCostumeColor, orbColor, controllerButtonColor } from '../theme/colors';

import wallUrl from './models/first-wall-vr.obj';
import backWallUrl from './models/back-wall-vr.obj';
import roomUrl from './models/space-vr.obj';
import isometricWallUrl from './models/first-wall-isometric.obj';
import isometricRoomUrl from './models/space-isometric.obj';
import roomTextureUrl from './models/bake/VR_AOMap.jpg';
import isometricRoomTextureUrl from './models/bake/ISO_AOMap.png';
import shadowTextureUrl from './shadow.png';

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
const enableRoomTexturesInVR = !feature.isMobile;

const props = {
  perspectiveWall: [wallUrl],
  perspectiveBackWall: [backWallUrl],
  perspectiveRoom: [roomUrl, enableRoomTexturesInVR ? roomTextureUrl : undefined, true],
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
      new MeshLambertMaterial({ color: controllerButtonColor.getHex() })
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

  shadow: (function createShadow() {
    const texture = new THREE.TextureLoader().load(shadowTextureUrl);
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.SubtractiveBlending,
    });
    const geometry = new THREE.PlaneBufferGeometry(0.5, 0.5, 1, 1);
    const plane = new THREE.Mesh(geometry, material);
    return plane;
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
