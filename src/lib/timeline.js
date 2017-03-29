import mitt from 'mitt';

export default function tl(initialTimeline) {
  const emitter = mitt();
  let timeline = initialTimeline || [];

  return {
    add(time, name, callback = false) {
      timeline.push({ time, name, callback, hasBeenCalled: false });
      timeline.sort((a, b) => a.time - b.time);
    },

    set(newTimeline) {
      timeline = newTimeline;
    },

    tick(timestamp) {
      const time = timestamp || 0;

      for (let i = 0; i < timeline.length; i++) {
        const timelineEvent = timeline[i];

        if (time > timelineEvent.time && !timelineEvent.hasBeenCalled) {
          this.emit(timelineEvent);
        }
      }
    },

    on(name, callback) {
      return emitter.on(name, callback);
    },

    emit(timelineEvent) {
      // mark the event as called
      timelineEvent.hasBeenCalled = true;

      // emit the event
      emitter.emit(timelineEvent.name);

      // callback if one exists
      if (timelineEvent.callback) {
        timelineEvent.callback();
      }
    },
  };
}
