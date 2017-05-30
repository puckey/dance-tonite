import { tempVector } from '../utils/three';
import audio from '../audio';
import { getPosition, getQuaternion } from '../utils/serializer';

export const secondsToFrames = (seconds) => Math.floor((seconds % (audio.loopDuration * 2)) * 90);

export const transformMesh = (
  instancedMesh,
  positions,
  index,
  performanceIndex,
  limbIndex,
  scale,
  color,
  offset,
) => {
  instancedMesh.setPositionAt(
    index,
    getPosition(positions, performanceIndex, limbIndex, offset)
  );
  instancedMesh.setQuaternionAt(
    index,
    getQuaternion(positions, performanceIndex, limbIndex, offset)
  );
  instancedMesh.setScaleAt(
    index,
    tempVector(scale, scale, scale)
  );
  instancedMesh.setColorAt(
    index,
    color,
  );
  instancedMesh.needsUpdate();
};
