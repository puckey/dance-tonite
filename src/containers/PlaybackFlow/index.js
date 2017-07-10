/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import CMSMenu from '../../components/CMSMenu';
import Container from '../../components/Container';
import Playback from '../Playback';
import Submission from '../Submission';
import CreateGIF from '../CreateGIF';

import recording from '../../recording';
import router from '../../router';
import viewer from '../../viewer';
import feature from '../../utils/feature';

import analytics from '../../utils/analytics';

export default class PlaybackFlow extends Component {
  constructor({ roomId }) {
    super();
    const hasRoomId = roomId !== undefined;
    const fromRecording = recording.exists() && hasRoomId;

    this.state = {
      mode: (!hasRoomId || fromRecording)
        ? 'playback'
        : 'submission',
      fromRecording,
      count: 0,
    };
    this.performGotoFullExperience = this.performGotoFullExperience.bind(this);
    this.performGotoSubmission = this.performGotoSubmission.bind(this);
    this.goto = this.goto.bind(this);
  }

  goto(mode) {
    const count = this.state.count + 1;
    this.setState({ count });
    analytics.recordSectionChange(mode);
    if (mode === 'gif') {
      this.setState({ mode });
      return;
    }
    router.navigate(mode);
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
    analytics.recordSectionChange('Playback');
  }

  performGotoSubmission() {
    this.setState({
      mode: 'submission',
    });
    analytics.recordSectionChange('Submission');
  }

  renderMenu() {
    const { fromRecording, mode } = this.state;
    const { presenting } = this.context;
    return process.env.FLAVOR === 'cms'
      ? <CMSMenu
        vr audio mute
        submissions inbox publish
      />
      : (presenting && feature.vrPolyfill)
        ? <Menu />
        : (
          fromRecording || mode === 'submission'
            ? <Menu about mute />
            : <Menu vr addRoom about mute />
      );
  }

  render(
    props,
    { mode, fromRecording }
  ) {
    console.log(mode);
    return (
      <Container>
        { this.renderMenu() }
        {
          mode === 'playback'
            ? <Playback
              {...props}
              inContextOfRecording={fromRecording}
              onGotoSubmission={this.performGotoSubmission}
              colophon={!fromRecording}
            />
            : mode === 'gif'
              ? <CreateGIF
                {...props}
                inContextOfRecording={fromRecording}
                goto={this.goto}
              />
              : <Submission
                {...props}
                goto={this.goto}
                fromRecording={fromRecording}
                onGotoFullExperience={this.performGotoFullExperience}
              />
        }
      </Container>
    );
  }
}
