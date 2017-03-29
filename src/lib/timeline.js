import mitt from 'mitt';

export default (e = []) => {
  const timeline = mitt();
  let lastTime;
  let lastIndex;
  let events;

  Object.assign(timeline, {
    add(event) {
      timeline.push(event);
      timeline.sort((a, b) => a.time - b.time);
    },

    remove(event) {
      const index = events.indexOf(event);
      if (index !== -1) {
        events.splice(index, 1);
      }
    },

    replace(newEvents) {
      events = newEvents.slice(0);
      events.sort((a, b) => a.time - b.time);
    },

    tick(time = 0) {
      if (time === lastTime) return;

      // If we went back in time, reset the timeline:
      // TODO: should we reset to the last event after the new time?
      if ((lastTime !== undefined && time < lastTime) || !lastIndex) {
        lastIndex = 0;
        lastTime = null;
      }

      for (let i = (lastIndex || 0); i < events.length; i++) {
        const event = events[i];
        if (time >= event.time) {
          timeline.emit(event.name, event);

          // call optional callback
          if (event.callback) {
            event.callback();
          }

          if (event.once) {
            timeline.remove(event);
          }

          lastIndex = i + 1;
        }
      }
      lastTime = time;
    },
  });

  timeline.replace(e);

  return timeline;
};
