import settings from './settings';
import viewer from './viewer';

let prevTime;
let frames = 0;
let fps = 60;
let hidden = false;
let cullDistance = settings.cullDistance;
let resIncreaseEnabled = true;
let resIncreaseCount = 0;
const resIncreaseDelta = 0.025;
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
      fps = (frames * 1000) / (time - prevTime);
      // Change FPS to multiples of 2.5 in order to ignore slight fluctuations:
      fps = Math.min(55, Math.round(fps * 0.4) * 2.5);
      frames = 0;
      prevTime = time;
      const lastCullDistance = settings.cullDistance;

      // if the fps is between 50 and 55, don't do anything
      if (fps < 50) {
        settings.cullDistance = Math.max(
          settings.minCullDistance,
          settings.cullDistance - settings.roomDepth
        )
      } else if (fps >= 55) {
        settings.cullDistance = Math.min(
          settings.maxCullDistance,
          settings.cullDistance + settings.roomDepth
        )
      }

      // if we're in VR and doing resolution increases
      if (viewer.vrEffect.isPresenting) {
        const currentRenderRatio = viewer.vrEffect.getVRResolutionRatio();

        // if the fps is between 50 and 55, don't do anything
        if (fps < 50) {
          // if we've done an increase, but FPS has dropped, then we've hit a wall
          // and further tweaks will fight with the room culling. Revert resolution
          // and stop changing it
          if (resIncreaseCount > 0 ) {
            // undo last increase and stop increasing
            viewer.vrEffect.setVRResolutionRatio(currentRenderRatio - resIncreaseDelta);
            resIncreaseCount--;
            resIncreaseEnabled = false; // don't do any more increases

            if (logging) console.log("reverting res to " + (currentRenderRatio - resIncreaseDelta));
          }
        }
        else if (fps >= 55) {
          // if currently full cull distance
          if ( resIncreaseEnabled 
            && (lastCullDistance == settings.cullDistance) 
            && (settings.cullDistance == settings.maxCullDistance) 
            && (currentRenderRatio < 1.0) ) {

            // increase the resolution
            viewer.vrEffect.setVRResolutionRatio(Math.min(currentRenderRatio + resIncreaseDelta, 1));
            resIncreaseCount++;

            if (logging) console.log("increasing res to " + (currentRenderRatio + resIncreaseDelta));
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
