import emitter from 'mitt';

let context;
let source;
let gainNode;
let loopCount;
let duration = 0;
let loopDuration;
let lastTime = 0;
let startTime = 0;

const audio = Object.assign(emitter(), {
  tick() {
    if (!source.buffer) return;

    const time = this.time = (context.currentTime - startTime) % duration;
    // If the loop has restarted
    if (time < lastTime) {
      const loopIndex = Math.floor(time / duration * loopCount);
      audio.emit('loop', loopIndex);
    }

    // The position within the track as a multiple of loopDuration:
    this.progress = time / loopDuration;

    // The position within the individual loop as a value between 0 - 1:
    this.loopProgress = (time % loopDuration) / loopDuration;

    lastTime = time;
  },

  load: ({ src, loops = 1 }, callback) => {
    if (context) context.close();

    context = new AudioContext();
    source = context.createBufferSource();
    gainNode = context.createGain();

    source.connect(gainNode);
    gainNode.connect(context.destination);

    // Reset time, set loop count
    lastTime = 0;
    loopCount = loops;

    const request = new XMLHttpRequest();
    request.open('GET', src, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      context.decodeAudioData(
        request.response,
        (response) => {
          // Load the file into the buffer
          source.buffer = response;

          duration = source.buffer.duration;
          loopDuration = duration / loopCount;
          source.loop = true;

          // Start audio and immediately suspend playback
          source.start(0);
          context.suspend();

          if (callback) callback(null, src);
          audio.emit('load', src);
        },
        (err) => { callback(err); },
      );
    };

    request.send();
  },

  restart() {
    startTime = context.currentTime;
    source.start(0);
  },

  play() { context.resume(); },

  pause() { context.suspend(); },

  fadeOut(callback) {
    const fadeDuration = 2;
    // Fade out the music in 2 seconds
    gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + fadeDuration);

    setTimeout(callback, fadeDuration * 1000);
    audio.emit('faded-out');
  },

  time: 0,
});

export default audio;
