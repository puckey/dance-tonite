/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Room from '../../components/Room';
import Menu from '../../components/Menu';
import Align from '../../components/Align';
import Twitter from '../../components/Twitter';
import Facebook from '../../components/Facebook';
import GooglePlus from '../../components/GooglePlus';
import ButtonItem from '../../components/ButtonItem';
import audio from '../../audio';
import viewer from '../../viewer';
import feature from '../../utils/feature';
import Container from '../../components/Container';

export default class Submission extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'Loading performance…',
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

  share(service) {
    window.open(
      `${this.shareURL[service]}${this.deepLink}`,
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
  }

  render({ roomId, recordingId }) {
    this.deepLink = `https://tonite.dance/${roomId}/${recordingId}`;
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
        <Align type="bottom-left">
          <p className="share-buttons">Share</p>
          <Align type="inline" rows>
            <GooglePlus onClick={() => this.share('googlePlus')} />
            <Twitter onClick={() => this.share('twitter')} />
            <Facebook onClick={() => this.share('facebook')} />
          </Align>
          <p className="share-buttons">
            <a href={this.deepLink}>{this.deepLink}</a>
          </p>
        </Align>
        { feature.has6DOF &&
          <Align type="bottom-right">
            <ButtonItem text navigate="/">Create animated GIF</ButtonItem>
          </Align>
        }
      </Container>
    );
  }
}
