/**
 * @author mrdoob / http://mrdoob.com/
 * reduced by @customlogic & @puckey
 */

const roundToDecimals = (val, d) => Number(`${Math.round(`${val}e${d}`)}e-${d}`);

let prevTime;
let frames = 0;
export default (interval = 1000) => {
  frames++;
  const time = (performance || Date).now();
  if (prevTime === undefined) prevTime = time;
  if (time > prevTime + interval) {
    const fps = (frames * 1000) / (time - prevTime);
    console.log(`${roundToDecimals(fps, 1)} fps`);
    frames = 0;
    prevTime = time;
  };
};
