import mitt from 'mitt';

export default function tl(initialTimeline) {
  const emitter = mitt();
  let timeline = initialTimeline || [];

  return {
    add(time, marker, callback = false, once = false) {
      timeline.push({ time, marker, callback, once, hasBeenCalled: false });
      timeline.sort((a, b) => a.time - b.time);
    },

    once(time, marker, callback = false) {
      this.add(time, marker, callback, true);
    },

    set(newTimeline) {
      timeline = newTimeline;
    },

    tick(timestamp) {
      const time = timestamp || 0;

      for (let i = 0; i < timeline.length; i++) {
        const timelineEvent = timeline[i];

        if (time > timelineEvent.time) {
          if (
            (!timeline[i + 1] || (timeline[i + 1] && time <= timeline[i + 1].time)) &&
            (!timelineEvent.once || !timelineEvent.hasBeenCalled)
          ) {
            this.emit(timelineEvent);
          }
        }
      }
    },

    on(marker, callback) {
      return emitter.on(marker, callback);
    },

    emit(timelineEvent) {
      // mark the event as called
      timelineEvent.hasBeenCalled = true;

      // emit the marker as an event
      emitter.emit(timelineEvent.marker);

      // callback if one exists
      if (timelineEvent.callback) {
        timelineEvent.callback();
      }
    },
  };
}
