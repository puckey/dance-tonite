import { tempQuaternion, tempVector } from '../utils/three';
import audio from '../audio';
import settings from '../settings';

export const secondsToFrames = (seconds) => Math.floor((seconds % (audio.loopDuration * 2)) * 90);

export const getPosition = (positions, arrayOffset, offset) => tempVector(
  positions[arrayOffset] * 0.0001,
  positions[arrayOffset + 1] * 0.0001,
  positions[arrayOffset + 2] * 0.0001 - settings.roomOffset
).add(offset);

export const getQuaternion = (positions, arrayOffset) => tempQuaternion(
  positions[arrayOffset + 3] * 0.0001,
  positions[arrayOffset + 4] * 0.0001,
  positions[arrayOffset + 5] * 0.0001,
  positions[arrayOffset + 6] * 0.0001
);

export const transformMesh = (
  instancedMesh,
  positions,
  index,
  arrayOffset,
  scale,
  color,
  offset,
) => {
  instancedMesh.setPositionAt(
    index,
    getPosition(positions, arrayOffset, offset)
  );
  instancedMesh.setQuaternionAt(
    index,
    getQuaternion(positions, arrayOffset, offset)
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
