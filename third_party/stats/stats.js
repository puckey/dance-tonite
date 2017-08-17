/**
 * @author mrdoob / http://mrdoob.com/
 * reduced by @customlogic & @puckey
 */

let prevTime;
let frames = 0;
let initialized = false;
let textOut;
let canvasInfoOut;

function initialize() {
  initialized = true;
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:0;right:0;cursor:pointer;opacity:0.9;z-index:10000';
  document.body.appendChild(container);

  textOut = document.createElement('div');
  textOut.style.cssText = 'background-color:#000;color:#f00;font-size: 24pt;padding: 5px;text-align:right';
  container.appendChild(textOut);

  canvasInfoOut = document.createElement('div');
  canvasInfoOut.style.cssText = 'background-color:#000;color:#ff0;font-size: 14pt;padding: 5px;';
  container.appendChild(canvasInfoOut);
}

export default (renderer, interval = 1000) => {
  if (!initialized) initialize();
  frames++;
  const time = (performance || Date).now();
  if (prevTime === undefined) prevTime = time;
  if (time > prevTime + interval) {
    const fps = (frames * 1000) / (time - prevTime);
    const fpsString = `${fps.toFixed(1)} fps`;
    const canvasString = `dpr:${renderer.getPixelRatio()} w:${renderer.domElement.width} h:${renderer.domElement.height}`;
    console.log(fpsString + ' ' + canvasString);
    textOut.innerHTML = fpsString;
    canvasInfoOut.innerHTML = canvasString;

    frames = 0;
    prevTime = time;
  }
};
