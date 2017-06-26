/** @jsx h */
import { h, Component } from 'preact';

import Room from '../../components/Room';
import Menu from '../../components/Menu';
import Align from '../../components/Align';
import ButtonItem from '../../components/ButtonItem';
import ShareButtons from '../../components/ShareButtons';
import audio from '../../audio';
import viewer from '../../viewer';
import feature from '../../utils/feature';
import Container from '../../components/Container';

export default class Submission extends Component {
  constructor({ roomId, recordingId }) {
    super();
    this.state = {
      loading: 'Loading performance…',
      deepLink: `https://tonite.dance/${roomId}/${recordingId}`,
    };

    if (viewer.vrEffect.isPresenting) {
      viewer.vrEffect.exitPresent();
    }
    viewer.switchCamera('orthographic');

    this.shareURL = {
      googlePlus: 'https://plus.google.com/share?url=',
      twitter: 'https://twitter.com/intent/tweet?text=',
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  render({ roomId, recordingId }, { deepLink }) {
    return (
      <Container>
        <Menu
          about
          mute
          close
        />
        <Room
          roomId={roomId}
          id={recordingId}
          orbs
        />
        <ShareButtons deepLink={deepLink} />
        { feature.has6DOF &&
          <Align type="bottom-right">
            <ButtonItem text="Create animated GIF" navigate="/" />
          </Align>
        }
      </Container>
    );
  }
}
