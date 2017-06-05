import {
  tempQuaternion,
  tempQuaternion2,
  tempVector,
} from '../utils/three';
import audio from '../audio';
import settings from '../settings';

export const secondsToFrames = (seconds) => Math.floor((seconds % (audio.loopDuration * 2)) * 90);

export const getPosition = (positions, arrayOffset, offset) => tempVector(
  positions[arrayOffset] * 0.0001,
  positions[arrayOffset + 1] * 0.0001,
  positions[arrayOffset + 2] * 0.0001 - settings.roomOffset
).add(offset);

const getQuaternion = (
  positions, arrayOffset, _tempQuaternion = tempQuaternion) => _tempQuaternion(
  positions[arrayOffset + 3] * 0.0001,
  positions[arrayOffset + 4] * 0.0001,
  positions[arrayOffset + 5] * 0.0001,
  positions[arrayOffset + 6] * 0.0001
);

export const avgPosition = (lower, higher, ratio, offset, position) => {
  const x1 = lower[offset] * 0.0001;
  const y1 = lower[offset + 1] * 0.0001;
  const z1 = lower[offset + 2] * 0.0001;
  if (!higher) {
    return tempVector(x1, y1, z1 - settings.roomOffset).add(position);
  }
  const x2 = higher[offset] * 0.0001;
  const y2 = higher[offset + 1] * 0.0001;
  const z2 = higher[offset + 2] * 0.0001;
  return tempVector(
    x1 + (x2 - x1) * ratio,
    y1 + (y2 - y1) * ratio,
    z1 + (z2 - z1) * ratio - settings.roomOffset
  ).add(position);
};

const avgQuaternion = (lower, higher, ratio, offset) => {
  const quaternion = getQuaternion(lower, offset);
  if (higher) {
    quaternion.slerp(getQuaternion(higher, offset, tempQuaternion2), ratio);
  }
  return quaternion;
};

export const transformMesh = (
  instancedMesh,
  lower,
  higher,
  ratio,
  index,
  arrayOffset,
  scale,
  color,
  offset,
) => {
  instancedMesh.setPositionAt(
    index,
    avgPosition(
      lower,
      higher,
      ratio,
      arrayOffset,
      offset
    )
  );
  instancedMesh.setQuaternionAt(
    index,
    avgQuaternion(
      lower,
      higher,
      ratio,
      arrayOffset
    )
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
