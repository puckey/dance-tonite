/** @jsx h */
import { Component } from 'preact';

import viewer from '../../viewer';
import audio from '../../audio';
import createTimeline from '../../lib/timeline';

export default class ControllersInstructions extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    viewer.events.on('tick', this.tick);
    this.timeline = createTimeline(this.props.keyframes);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.events.off('tick', this.tick);
  }

  tick() {
    const { tick } = this.props;
    this.timeline.tick(
      tick === 'progress'
        ? audio.progress
        : audio.currentTime
      );
  }
}
