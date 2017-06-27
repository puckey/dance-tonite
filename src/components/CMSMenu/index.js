/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonInbox from '../../components/ButtonInbox';
import ButtonSubmissions from '../../components/ButtonSubmissions';
import ButtonPublish from '../../components/ButtonPublish';
import ButtonClose from '../../components/ButtonClose';
import EnterVROverlay from '../../components/EnterVROverlay';
import AudioControls from '../../components/AudioControls';

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
    publish,
  }) {
    return (
      <div class="cms-menu">
        { this.state.vrOverlay
          ? <EnterVROverlay />
          : null
        }
        <Align type="top-left" margin rows>
          {vr ? <ButtonEnterVR toggleVROverlay={this.toggleVROverlay} /> : null}
          {mute ? <ButtonMute /> : null}
          {submissions ? <ButtonSubmissions /> : null}
          {inbox ? <ButtonInbox unreadCount={unreadCount} /> : null}
        </Align>
        {
          close
            ? <Align type="top-right" margin rows>
              <ButtonClose navigate="/" />
            </Align>
            : null
        }
        {
          audio
            ? <Align type="top-right" margin rows>
              <AudioControls />
            </Align>
            : null
        }
        {
          publish
            ? <Align type="bottom-right" margin rows>
              <ButtonPublish />
            </Align>
            : null
        }

      </div>
    );
  }
}
