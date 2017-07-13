import settings from './settings';
import viewer from './viewer';

let prevTime;
let frames = 0;
let fps = 60;
let hidden = false;
let cullDistance = settings.cullDistance;
let fogNear = settings.fogNear;
const logging = false;

document.addEventListener('visibilitychange', () => {
  hidden = document.hidden;
});

export default (interval = 3000) => {
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
    // Change FPS to multiples of 50 in order to ignore slight fluctuations:
    fps = Math.min(55, Math.round(fps * 0.2) * 5);
    frames = 0;
    prevTime = time;
    const lastCullDistance = cullDistance;
    cullDistance = fps <= 50
      ? Math.max(
        settings.minCullDistance,
        cullDistance - settings.roomDepth
      )
      : Math.min(
        settings.maxCullDistance,
        cullDistance + settings.roomDepth
      );
    fogNear = settings.cullDistance - settings.roomDepth;
    if (logging && lastCullDistance !== cullDistance) {
      console.log(`${lastCullDistance > cullDistance ? 'Lowering' : 'Upping'} cull distance to`, cullDistance);
    }
  }
  settings.cullDistance = settings.cullDistance * 0.95 + cullDistance * 0.05;
  settings.fogNear = settings.fogNear * 0.95 + fogNear * 0.05;
  viewer.fog.near = settings.fogNear;
};
