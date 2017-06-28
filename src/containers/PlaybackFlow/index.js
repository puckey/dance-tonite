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
    this.goto = this.goto.bind(this);
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
    router.navigate(mode);
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  goto(mode) {
    if (mode === 'playback') {
      if (recording.exists()) {
        recording.destroy();
      }
      this.setState({ fromRecording: false });
    }
    this.setState({ mode });
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
          mode === 'gif'
            ? <CreateGIF
              {...props}
              inContextOfRecording={fromRecording}
              goto={this.goto}
            />
            : mode === 'playback'
              ? <Playback
                {...props}
                inContextOfRecording={fromRecording}
                goto={this.goto}
              />
              : <Submission
                {...props}
                fromRecording={fromRecording}
                goto={this.goto}
              />
        }
      </Container>
    );
  }
}
