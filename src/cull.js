import settings from './settings';
import viewer from './viewer';

let prevTime;
let frames = 0;
let fps = 60;
let hidden = false;
let cullDistance = settings.cullDistance;
const logging = settings.logging;

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
