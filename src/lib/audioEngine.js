let context, source;
let lastTime = 0;
let loopCount = 1;
let duration = 0;

const tick = () => {
  const time = context.currentTime % (duration / loopCount);
  if (source.buffer) {
    if (time < lastTime && values.onLoop) {
      values.onLoop(Math.floor(context.currentTime * loopCount / duration));
    }
    lastTime = time;
    values.loopRatio = time * loopCount / duration;
  }
};

const play = () => {
  context.resume();
};

const pause = () => {
  context.suspend();
};

const fadeOut = callback => {
  //TODO fadeout
  pause();
  if (callback) callback();
};

const load = ({src, loops = 1}, callback) => {
  if (context) context.close();
  context = new AudioContext();
  source = context.createBufferSource();
  source.connect(context.destination);
  lastTime = 0;
  loopIndex = 0;
  loopCount = loops;

  let request = new XMLHttpRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    context.decodeAudioData(
      request.response,
      response => {
        source.buffer = response;
        duration = source.buffer.duration;
        source.loop = true;
        source.start(0);
        context.suspend();
        callback();
      },
      () => {
        console.error('The request failed.');
      },
    );
  };

  request.send();
};

const values = {
  tick,
  load,
  play,
  pause,
  fadeOut,
  onLoop,
  loopRatio: 0
};

export default values;
