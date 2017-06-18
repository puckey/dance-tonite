/** @jsx h */
import { h, Component } from 'preact';

import viewer from '../../viewer';
import { getRoomColorByIndex } from '../../theme/colors';
import { Color } from '../../lib/three';

import AudioTimeline from '../AudioTimeline';

const BLACK = new Color(0x000000);

export default class BackgroundTimeline extends Component {
  constructor() {
    super();
    this.performChangeBackground = this.performChangeBackground.bind(this);

    this.keyframes = [
      0, 184.734288, 186.80405, 188.837803, 190.804763, 191.688472, 192.238635,
      192.820638, 194.788529, 196.83769, 198.822996, 199.722769, 200.289696,
      200.806389, 202.840048, 204.790524, 206.671341, 207.190921, 207.722044,
      208.191224, 208.491519, 208.824357, 210.824968, 212.807214, 216.824266,
    ].map((time, index, times) => (
      {
        time,
        color: (
          index === 0 ||
          index === times.length - 1
        ) ? BLACK
          : getRoomColorByIndex(index + 23),
      }
    ));
  }

  componentWillMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.renderer.setClearColor(BLACK);
  }

  performChangeBackground({ color }) {
    viewer.renderer.setClearColor(color || BLACK);
  }

  render() {
    return (
      <AudioTimeline
        keyframes={this.keyframes}
        callback={this.performChangeBackground}
      />
    );
  }
}
