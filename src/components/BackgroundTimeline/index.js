/** @jsx h */
import { h, Component } from 'preact';

import viewer from '../../viewer';
import settings from '../../settings';
import { getRoomColorByIndex } from '../../theme/colors';
import { Color } from '../../lib/three';

import AudioTimeline from '../AudioTimeline';
import createTweener from '../../utils/tween';

const tween = createTweener();
const BLACK = new Color(0x000000);
const EASE_COLOR = new Color();

export default class BackgroundTimeline extends Component {
  constructor() {
    super();
    this.performChangeBackground = this.performChangeBackground.bind(this);

    this.keyframes = settings.colorTimes
      .map((time, index, times) => (
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
    tween(
      EASE_COLOR.copy(color).multiplyScalar(0.7),
      Object.assign({
        ease: 'easeOutCubic',
        duration: 1,
        onUpdate: () => viewer.renderer.setClearColor(EASE_COLOR),
      }, BLACK)
    );
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
