/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Playback from '../Playback';
import Submission from '../Submission';
import recording from '../../recording';

export default class PlaybackFlow extends Component {
  constructor() {
    super();
    this.state = {};
    this.performGotoFullExperience = this.performGotoFullExperience.bind(this);
    this.performGotoSubmission = this.performGotoSubmission.bind(this);
  }

  componentWillMount() {
    this.setState({
      mode: 'playback',
      fromRecording: !!recording.frames,
    });
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  performGotoFullExperience() {
    this.setState({
      mode: 'playback',
      fromRecording: false,
    });
  }

  performGotoSubmission() {
    this.setState({
      mode: 'submission',
    });
  }

  render(
    props,
    { mode, overlay, fromRecording }
  ) {
    return (
      <Container>
        <Menu
          mute
          close
          overlay={overlay}
        />
        {
          mode === 'playback'
            ? <Playback
              {...props}
              inContextOfRecording={fromRecording}
              onGotoSubmission={this.performGotoSubmission}
            />
            : <Submission
              fromRecording={fromRecording}
              onGotoFullExperience={this.performGotoFullExperience}
            />
        }
      </Container>
    );
  }
}
