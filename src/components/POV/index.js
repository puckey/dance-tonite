/** @jsx h */
import { h, Component } from 'preact';

import viewer from '../../viewer';
import createPov from '../../pov';
import audio from '../../audio';
import Align from '../Align';
import RecordBlinker from '../RecordBlinker';

export default class POV extends Component {
  constructor() {
    super();
    this.state = {
      inPOV: false,
    };
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.pov = createPov(this.props);
    if (this.props.enterHeads) {
      this.pov.setupInput();
    }
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
    this.pov.removeInput();
  }

  tick() {
    const progress = this.props.totalProgress
      ? audio.totalProgress
      : audio.progress;
    this.pov.update(progress, !!this.props.fixedControllers);

    const inPOV = this.pov.isInPOV();
    if (this.state.inPOV !== inPOV) {
      this.setState({ inPOV });
    }
  }

  render() {
    return this.state.inPOV ? (
      <Align type="top-right">
        <RecordBlinker />
      </Align>
    ) : null;
  }
}
