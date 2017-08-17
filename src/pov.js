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
import closestHead from './utils/closestHead';
import intersectOrb from './utils/intersectcenter';
import feature from './utils/feature';
import viewer from './viewer';
import InstancedItem from './instanced-item';
import Room from './room';
import layout from './room/layout';
import settings from './settings';
import audio from './audio';
import deps from './deps';

import analytics from './utils/analytics';

export default function create({ rooms, orb, offset = 0 }) {
  const { holeHeight } = settings;
  let pointerX;
  let pointerY;
  let hoverPerformance;
  let hoverOrb;
  let inPOV = false;

  const onMouseMove = ({ clientX, clientY }) => {
    if (viewer.vrEffect.isPresenting) return;
    pointerX = clientX;
    pointerY = clientY;
  };

  const onMouseDown = ({ clientX, clientY, touches }) => {
    if (viewer.vrEffect.isPresenting) return;

    if (feature.isMobile && (hoverPerformance || hoverOrb)) {
      hoverPerformance = null;
      hoverOrb = false;
      InstancedItem.group.remove(viewer.camera);
      viewer.switchCamera('orthographic');
      inPOV = false;
      return;
    }

    if (hoverPerformance || hoverOrb) {
      return;
    }

    let x = clientX;
    let y = clientY;
    if (touches && touches.length === 1) {
      x = touches[0].pageX;
      y = touches[0].pageY;
    }

    hoverOrb = intersectOrb(x, y);
    hoverPerformance = closestHead(x, y, rooms);

    if (hoverPerformance || hoverOrb) {
      viewer.switchCamera('default');
      InstancedItem.group.add(viewer.camera);
      if (hoverPerformance) analytics.recordHeadSelectStart();
      else if (hoverOrb) analytics.recordOrbSelectStart();

      inPOV = true;
    }
  };

  const onMouseUp = ({ touches }) => {
    if (viewer.vrEffect.isPresenting) return;

    if (feature.isMobile) {
      return;
    }

    if (touches && touches.length >= 1) {
      return;
    }

    if (hoverPerformance) analytics.recordHeadSelectStop();
    else if (hoverOrb) analytics.recordOrbSelectStop();
    hoverPerformance = null;
    hoverOrb = false;
    InstancedItem.group.remove(viewer.camera);
    viewer.switchCamera('orthographic');

    inPOV = false;
  };

  const clearHighlights = () => {
    InstancedItem.group.remove(viewer.camera);
    hoverPerformance = null;
    hoverOrb = false;
    if (orb) {
      orb.unhighlight();
    }
    Room.setHighlight();
  };

  // Whenever the audio loops, move to the next head if necessary:
  const onLoop = (loopIndex) => {
    if (!hoverPerformance) return;
    const [index, headIndex] = hoverPerformance;
    if (
      (index % 2 === 0 && loopIndex % 2 === 1) ||
      (index % 2 === 1 && loopIndex % 2 === 0)
    ) {
      hoverPerformance[1] = (headIndex + 1) % rooms[index].frame.count;
      Room.setHighlight(hoverPerformance);
    }
  };

  window.addEventListener('vrdisplaypresentchange', clearHighlights, false);

  audio.on('loop', onLoop);

  const POV = {
    update: (progress = 0, fixedControllers = false) => {
      if (!viewer.vrEffect.isPresenting && !feature.isMobile) {
        if (intersectOrb(pointerX, pointerY) && !inPOV) {
          if (orb) {
            orb.highlight();
          }
          Room.setHighlight();
        } else {
          if (orb) {
            orb.unhighlight();
          }
          if (!hoverPerformance && !hoverOrb) {
            Room.setHighlight(
              closestHead(
                pointerX,
                pointerY,
                rooms
              )
            );
          }
        }
      }

      //  unfortunately mobile needs to be handled a bit differently
      if (!viewer.vrEffect.isPresenting && feature.isMobile) {
        if (inPOV && hoverPerformance) {
          Room.setHighlight(hoverPerformance);
        } else {
          Room.setHighlight();
        }
      }

      const position = layout.getPosition(progress + offset + 0.5);
      position.y += holeHeight;
      position.z *= -1;

      if (fixedControllers) {
        deps.controllers.fixToPosition(position);
      }
      viewer.camera.position.copy(position);
      if (hoverOrb) {
        // Move camera into orb:
        viewer.camera.position.z *= -1;
        viewer.camera.rotation.set(0, Math.PI, 0);
      } else if (hoverPerformance) {
        // Move camera into head of performance:
        const [index, headIndex] = hoverPerformance;
        rooms[index].transformToHead(viewer.camera, headIndex);
      }
    },

    setupInput: () => {
      if (feature.isMobile) {
        window.addEventListener('touchstart', onMouseDown, false);
        window.addEventListener('touchend', onMouseUp, false);
      } else {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
      }
    },

    removeInput: () => {
      if (feature.isMobile) {
        window.removeEventListener('touchstart', onMouseDown);
        window.removeEventListener('touchend', onMouseUp);
      } else {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
      }
      window.removeEventListener('vrdisplaypresentchange', clearHighlights);
      audio.off('loop', onLoop);
    },

    isInPOV: () => inPOV,

    clearHighlights,
  };

  return POV;
}
