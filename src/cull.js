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
import settings from './settings';
import viewer from './viewer';

let prevTime;
let frames = 0;
let fps = 60;
let hidden = false;
let cullDistance = settings.cullDistance;
let resIncreaseEnabled = true;
let resIncreaseCount = 0;
const resIncreaseDelta = 0.05;
const logging = true;

document.addEventListener('visibilitychange', () => {
  hidden = document.hidden;
});

export default {
  tick: (interval = 3000) => {
    if (hidden) {
      prevTime = null;
      frames = 0;
      return fps;
    }
    frames++;
    const time = (performance || Date).now();
    if (prevTime == null) prevTime = time;
    if (time > prevTime + interval) {
      fps = Math.round((frames * 1000) / (time - prevTime));
      frames = 0;
      prevTime = time;
      const lastCullDistance = settings.cullDistance;

      // if the fps is between 52 and 56, don't do anything
      if (fps <= 52) {
        settings.cullDistance = Math.max(
          settings.minCullDistance,
          settings.cullDistance - settings.roomDepth
        );
      } else if (fps > 56) {
        settings.cullDistance = Math.min(
          settings.maxCullDistance,
          settings.cullDistance + settings.roomDepth
        );
      }

      // if we're in VR and doing resolution increases
      if (viewer.vrEffect.isPresenting) {
        const currentRenderRatio = viewer.vrEffect.getVRResolutionRatio();

        // if the fps is between 55 and 60, don't do anything
        if (fps <= 55) {
          // if we've done an increase, but FPS has dropped, then we've hit a wall
          // and further tweaks will fight with the room culling. Revert resolution
          // and stop changing it
          if (resIncreaseCount > 0) {
            // undo last increase and stop increasing
            viewer.vrEffect.setVRResolutionRatio(currentRenderRatio - resIncreaseDelta);
            resIncreaseCount--;
            resIncreaseEnabled = false; // don't do any more increases

            if (logging) console.log(`reverting res to ${(currentRenderRatio - resIncreaseDelta)}`);
          }
        } else if (fps >= 60) {
          // if currently full cull distance
          if (resIncreaseEnabled
            && (lastCullDistance === settings.cullDistance)
            && (settings.cullDistance === settings.maxCullDistance)
            && (currentRenderRatio < 1.0)) {
            // increase the resolution
            viewer.vrEffect.setVRResolutionRatio(Math.min(currentRenderRatio + resIncreaseDelta, 1));
            resIncreaseCount++;

            if (logging) console.log(`increasing res to ${(currentRenderRatio + resIncreaseDelta)}`);
          }
        }
      }
      if (logging && lastCullDistance !== settings.cullDistance) {
        console.log(`${lastCullDistance > settings.cullDistance ? 'Lowering' : 'Upping'} cull distance to`, settings.cullDistance);
      }
    }
    cullDistance = cullDistance * 0.95 + settings.cullDistance * 0.05;
    if (viewer.isOrthographic) {
      viewer.fog.near = settings.maxCullDistance;
      viewer.fog.far = settings.maxCullDistance;
    } else if (!viewer.isInsideTransition) {
      viewer.fog.near = cullDistance - settings.roomDepth;
      viewer.fog.far = cullDistance;
    }
  },

  setDistance: (distance) => {
    settings.cullDistance = cullDistance = distance;
  },

  reset: () => {
    prevTime = null;
    frames = 0;
  },
};
