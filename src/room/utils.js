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
import {
  tempVector,
} from '../utils/three';
import settings from '../settings';
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
