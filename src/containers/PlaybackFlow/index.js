/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import CMSMenu from '../../components/CMSMenu';
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
      fromRecording: recording.exists(),
    });
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  performGotoFullExperience() {
    if (recording.exists()) {
      recording.destroy();
    }
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

  renderMenu() {
    return process.env.FLAVOR === 'cms'
      ? <CMSMenu
        vr audio mute
        submissions inbox publish
      />
      : (
        this.state.fromRecording
          ? <Menu about mute close />
          : <Menu vr addRoom about mute />
      );
  }

  render(
    props,
    { mode, fromRecording }
  ) {
    return (
      <Container>
        { this.renderMenu() }
        {
          mode === 'playback'
            ? <Playback
              {...props}
              inContextOfRecording={fromRecording}
              onGotoSubmission={this.performGotoSubmission}
            />
            : <Submission
              {...props}
              fromRecording={fromRecording}
              onGotoFullExperience={this.performGotoFullExperience}
            />
        }
      </Container>
    );
  }
}
