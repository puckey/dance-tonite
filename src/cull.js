import settings from './settings';
import viewer from './viewer';

let prevTime;
let frames = 0;
let fps = 60;
let lastFps = 60;
let steadyCount = 0;
let hidden = false;
let cullDistance = settings.cullDistance;
let fogNear = 100;

document.addEventListener('visibilitychange', () => {
  hidden = document.hidden;
});

export default (interval = 1000) => {
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
    fps = Math.round(fps * 0.2) * 5;
    frames = 0;
    prevTime = time;

    if (fps === lastFps) {
      steadyCount++;
    } else {
      steadyCount = 0;
    }
    lastFps = fps;
    const lastCullDistance = cullDistance;
    if (fps < 60) {
      cullDistance = Math.max(
        settings.minCullDistance,
        cullDistance - settings.roomDepth
      );
    } else if (steadyCount > 3) {
      cullDistance = Math.min(
        settings.maxCullDistance,
        cullDistance + settings.roomDepth
      );
    }
    fogNear = settings.cullDistance - settings.roomDepth;
    if (lastCullDistance !== cullDistance) {
      console.log('Changed cull distance to', cullDistance);
    }
  }
  settings.cullDistance = settings.cullDistance * 0.8 + cullDistance * 0.2;
  settings.fogNear = settings.fogNear * 0.8 + fogNear * 0.2;
  viewer.fog.near = settings.fogNear;
  return fps;
};
