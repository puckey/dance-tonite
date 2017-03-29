import mitt from 'mitt';
import rafLoop from './rafLoop';

export default (initialTimeline) => {
  const emitter = mitt();
  const then = Date.now();
  let timeline = initialTimeline || [];

  const screenplay = {
    add(time, marker, callback = false) {
      timeline.push({ time, marker, callback });
    },

    set(newTimeline) {
      timeline = newTimeline;
    },

    tick(time) {
      for (let i = 0; i < timeline.length; i++) {
        const timelineEvent = timeline[i];

        if (time > timelineEvent.time) {
          // if there are no more events or there are and this one has not expired yet
          if (!timeline[i + 1] || (timeline[i + 1] && time <= timeline[i + 1].time)) {
            // emit the marker as an event
            emitter.emit(timelineEvent.marker);

            // callback if one exists
            if (timelineEvent.callback) {
              timelineEvent.callback();
            }
          }
        }
      }
    },

    on(marker, callback) {
      return emitter.on(marker, callback);
    },
  };

  rafLoop.add(() => {
    const time = Date.now() - then;
    screenplay.tick(time);
  });

  return screenplay;
};
