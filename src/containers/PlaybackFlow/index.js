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
      mode: 'playback',
      fromRecording,
      count: 0,
    };
    this.performGotoFullExperience = this.performGotoFullExperience.bind(this);
    this.performGotoSubmission = this.performGotoSubmission.bind(this);
    this.setMode = this.setMode.bind(this);
  }

  setMode(mode) {
    this.setState({ mode });
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
        ? <Menu
          close={this.performExitPresent}
        />
        : (
          fromRecording || /submission|gif/.test(mode)
            ? <Menu about mute />
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
              colophon={!fromRecording}
            />
            : mode === 'gif'
              ? <CreateGIF
                {...props}
                inContextOfRecording={fromRecording}
                goto={this.setMode}
              />
              : <Submission
                {...props}
                goto={this.setMode}
                fromRecording={fromRecording}
                onGotoFullExperience={this.performGotoFullExperience}
              />
        }
      </Container>
    );
  }
}
