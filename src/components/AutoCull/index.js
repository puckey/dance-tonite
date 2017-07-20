/** @jsx h */
import { Component } from 'preact';

import viewer from '../../viewer';
import cull from '../../cull';

export default class AudioTimeline extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
    viewer.on('tick', this.tick);
    cull.reset();
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
  }

  tick() {
    if (!viewer.insideTransition) cull.tick();
  }
}
