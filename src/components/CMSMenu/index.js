/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import router from '../../router';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonInbox from '../../components/ButtonInbox';
import ButtonSubmissions from '../../components/ButtonSubmissions';
import ButtonClose from '../../components/ButtonClose';
import EnterVROverlay from '../../components/EnterVROverlay';
import AudioControls from '../../components/AudioControls';

const navigateHome = () => router.navigate('/');

export default class CMSMenu extends Component {
  constructor() {
    super();
    this.state = {
      vrOverlay: false,
    };
    this.toggleVROverlay = this.toggleVROverlay.bind(this);
  }

  toggleVROverlay() {
    this.setState({
      vrOverlay: !this.state.vrOverlay,
    });
  }

  render({
    unreadCount,
    close,
    audio,
    vr,
    mute,
    submissions,
    inbox,
  }) {
    return (
      <div>
        { this.state.vrOverlay && <EnterVROverlay /> }
        <Align type="top-left" margin rows>
          {vr && <ButtonEnterVR toggleVROverlay={this.toggleVROverlay} />}
          {mute && <ButtonMute />}
          {submissions && <ButtonSubmissions />}
          {inbox && <ButtonInbox unreadCount={unreadCount} />}
        </Align>
        {
          close &&
          <Align type="top-right" margin rows>
            <ButtonClose onClick={navigateHome} />
          </Align>
        }
        {
          audio &&
          <Align type="top-right" margin rows>
            <AudioControls />
          </Align>
        }

      </div>
    );
  }
}
