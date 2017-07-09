import {
  tempVector,
} from '../utils/three';
import audio from '../audio';
import { avgPosition, avgQuaternion } from '../utils/serializer';

export const secondsToFrames = (seconds) => Math.floor((seconds % (settings.loopDuration * 2)) * 90);

export const transformMesh = (
  instancedMesh,
  lower,
  higher,
  ratio,
  index,
  performanceIndex,
  limbIndex,
  scale,
  color,
  offset,
  hidden,
  hiddenRatio
) => {
  instancedMesh.setPositionAt(
    index,
    avgPosition(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex,
      offset,
      hidden,
      hiddenRatio
    )
  );
  instancedMesh.setQuaternionAt(
    index,
    avgQuaternion(
      lower,
      higher,
      ratio,
      performanceIndex,
      limbIndex,
      hidden,
      hiddenRatio
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
