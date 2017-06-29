/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import CMSMenu from '../../components/CMSMenu';
import Container from '../../components/Container';
import Playback from '../Playback';
import Submission from '../Submission';

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
    this.onVRPresentChange = this.onVRPresentChange.bind(this);
  }

  componentDidMount() {
    viewer.on('vr-present-change', this.onVRPresentChange);
  }

  componentWillUnmount() {
    viewer.off('vr-present-change', this.onVRPresentChange);
  }

  onVRPresentChange(presenting) {
    if (feature.vrPolyfill) {
      this.setState({
        polyfillPresenting: presenting,
      });
    }
  }

  goto(mode) {
    const count = this.state.count + 1;
    this.setState({ count });
    analytics.recordSectionChange(mode.charAt(0).toUpperCase() + mode.slice(1));
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
    const { fromRecording, mode, polyfillPresenting } = this.state;
    return process.env.FLAVOR === 'cms'
      ? <CMSMenu
        vr audio mute
        submissions inbox publish
      />
      : polyfillPresenting
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
