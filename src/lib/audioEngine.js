let context, source, gainNode;
let lastTime = 0;
let loopCount = 1;
let duration = 0;

const tick = () => {
  // Calculate playback time within current loop
  const time = context.currentTime % (duration / loopCount);
  if (source.buffer) {
    // If the loop has restarted
    if (time < lastTime && values.onLoop) {
      // Pass the current iteration of the loop to the callback
      values.onLoop(Math.floor(context.currentTime * loopCount / duration));
    }
    // Calculate percentage of loop elapsed
    values.loopRatio = time * loopCount / duration;
    lastTime = time;
  }
};

// Aliases for playback control
const play = () => {
  context.resume();
};

const pause = () => {
  context.suspend();
};

const fadeOut = callback => {
  // Fade out the music in 2 seconds
  gainNode.gain.exponentialRampToValueAtTime(0.00, context.currentTime + 2);

  // Suspend playback, execute callback
  pause();
  if (callback) callback();
};

const load = ({src, loops = 1}, callback) => {
  // Close any existing context
  if (context) context.close();

  // Create context, buffer source and gain node
  context = new AudioContext();
  source = context.createBufferSource();
  gainNode = context.createGain();

  // Chain the nodes to the audio output
  source.connect(gain);
  gainNode.connect(context.destination);

  // Reset time, index, loop count
  lastTime = 0;
  loopIndex = 0;
  loopCount = loops;

  // Send a new request to load audio failed
  let request = new XMLHttpRequest();
  request.open('GET', src, true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    context.decodeAudioData(
      request.response,
      response => {
        // Load the file into the buffer
        source.buffer = response;

        // Set parameters
        duration = source.buffer.duration;
        source.loop = true;

        // Start audio and immediately suspend playback
        source.start(0);
        context.suspend();

        // Execute callback passed to the load() function
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
