/** @jsx h */
import { Component } from 'preact';

import viewer from '../../viewer';
import createPov from '../../pov';
import audio from '../../audio';

export default class POV extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.pov = createPov(this.props);
    if (this.props.enterHeads) {
      this.pov.setupInput();
    }
    viewer.events.on('tick', this.tick);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.events.off('tick', this.tick);
    if (this.props.enterHeads) {
      this.pov.removeInput();
    }
  }

  tick() {
    const progress = this.props.totalProgress
      ? audio.totalProgress
      : audio.progress;
    this.pov.update(progress, !!this.props.fixedControllers);
  }
}
