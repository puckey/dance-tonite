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
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  render({ roomId, recordingId }) {
    const deepLink = `https://tonite.dance/${roomId}/${recordingId}`;
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
          <Align type="inline" rows><GooglePlus /><Twitter /><Facebook /></Align>
          <p className="share-buttons">
            <a href={deepLink}>{deepLink}</a>
          </p>
        </Align>
        <Align type="bottom-right">
          <ButtonItem text navigate="/">Create animated GIF</ButtonItem>
        </Align>
      </Container>
    );
  }
}
