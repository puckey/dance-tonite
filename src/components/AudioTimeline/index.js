/** @jsx h */
import { Component } from 'preact';

import viewer from '../../viewer';
import audio from '../../audio';
import createTimeline from '../../lib/timeline';

export default class AudioTimeline extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    viewer.on('tick', this.tick);
    const { keyframes, callback } = this.props;
    this.timeline = createTimeline(keyframes, callback);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
  }

  tick() {
    const { progress, getTime } = this.props;
    this.timeline.tick(
      getTime
        ? getTime()
        : progress
          ? audio.progress
          : audio.time
      );
  }
}
