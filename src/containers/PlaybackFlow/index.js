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

  renderMenu() {
    return process.env.FLAVOR === 'cms'
      ? <CMSMenu
        vr audio mute
        submissions inbox publish
      />
      : (
        this.props.mode === 'playback'
          ? <Menu vr addRoom about mute />
          : <Menu about mute close />
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
              fromRecording={fromRecording}
              onGotoFullExperience={this.performGotoFullExperience}
            />
        }
      </Container>
    );
  }
}
