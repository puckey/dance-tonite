/** @jsx h */
import { h, Component } from 'preact';

import { sleep } from '../../utils/async';
import roundText from './round-text';

import RecordInstructions from '../RecordInstructions';

export default class RecordCountdown extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.mounted = true;
    this.beginCountdown();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async beginCountdown() {
    const { seconds, round } = this.props;
    this.setState({
      subtitle: roundText(round),
    });
    let remaining = seconds;
    while (remaining > -2) {
      if (remaining > 0) {
        this.setState({
          main: remaining.toString(),
        });
      } else if (remaining === 0) {
        this.setState({
          main: '',
          subtitle: 'DANCE!',
        });
      }
      remaining--;
      await sleep(1000);
      if (!this.mounted) {
        remaining = -2;
      }
    }
    this.setState({
      subtitle: '',
    });
  }

  render(props, { main, subtitle }) {
    return (
      <RecordInstructions
        main={main}
        subtitle={subtitle}
      />
    );
  }
}
