import createTimeline from './lib/timeline';
import { getRoomColorByIndex } from './theme/colors';
import audio from './audio';
import viewer from './viewer';
import { Color } from './lib/three';

const BLACK = new Color(0x000000);
const times = [
  0, 184.734288, 186.80405, 188.837803, 190.804763, 191.688472, 192.238635,
  192.820638, 194.788529, 196.83769, 198.822996, 199.722769, 200.289696,
  200.806389, 202.840048, 204.790524, 206.671341, 207.190921, 207.722044,
  208.191224, 208.491519, 208.824357, 210.824968, 212.807214, 216.824266,
];
const keyFrames = times.map((time, index) => (
  {
    time,
    name: 'change-color',
    color: (
      index === 0 ||
      index === times.length - 1
    ) ? BLACK
      : getRoomColorByIndex(index + 23),
  }
));


const timeline = createTimeline(keyFrames);
timeline.on('change-color', ({ color }) => {
  viewer.renderer.setClearColor(color);
});

export default {
  tick: () => {
    timeline.tick(audio.time);
  },
  destroy: () => {
    viewer.renderer.setClearColor(BLACK);
  },
};
