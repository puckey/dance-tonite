import mitt from 'mitt';

const emitter = mitt();
const timeline = [];

function add(time, marker, callback = false) {
  timeline.push({ time, marker, callback });
}

function tick(time) {
  for (let i = 0; i <= timeline.length; i++) {
    const timelineEvent = timeline[i];

    if (time > timelineEvent.time) {
      if (!timeline[i + 1] || (timeline[i + 1] && time <= timeline[i + 1].time)) {
        emitter.emit(timelineEvent.marker);
        timelineEvent.callback();
      }
    }
  }
}

function on(marker, callback) {
  return emitter.on(marker, callback);
}

export default { add, tick, on };
