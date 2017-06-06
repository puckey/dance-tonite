import * as THREE from './lib/three';
import { getHandMesh, getHeadMesh } from './room';
// import { LIMB_ELEMENT_COUNT } from './utils/serializer';

const highlightColor = new THREE.Color(0xffffff);

let headInstanceIndex;
let handInstanceIndex;

function set(playlist, roomIndex, performanceIndex) {
  let headInstanceCount = 0;
  let handInstanceCount = 0;

  for (let i = 0; i < roomIndex; i++) {
    if (playlist.rooms[i].hideHead === false) {
      headInstanceCount += playlist.rooms[i].instanceCount;
    }

    //  Do we need to use LIMB_ELEMENT_COUNT here?
    handInstanceCount += playlist.rooms[i].instanceCount * 2;
  }
  headInstanceIndex = headInstanceCount + performanceIndex;
  handInstanceIndex = handInstanceCount + performanceIndex;
}

function update() {
  const headMesh = getHeadMesh();
  if (headMesh && headInstanceIndex !== undefined) {
    headMesh.setColorAt(headInstanceIndex, highlightColor);
    headMesh.needsUpdate('color');
  }

  const handMesh = getHandMesh();
  if (handMesh && handInstanceIndex !== undefined) {
    handMesh.setColorAt(handInstanceIndex, highlightColor);
    handMesh.setColorAt(handInstanceIndex + 1, highlightColor);
    handMesh.needsUpdate('color');
  }
}

export default {
  set, update,
};
