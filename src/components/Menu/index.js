/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import router from '../../router';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonAbout from '../../components/ButtonAbout';
import ButtonAddRoom from '../../components/ButtonAddRoom';
import ButtonClose from '../../components/ButtonClose';
import EnterVROverlay from '../../components/EnterVROverlay';
import About from '../../components/About';

export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      about: false,
      vrOverlay: false,
    };
    this.toggleAbout = this.toggleAbout.bind(this);
    this.toggleVROverlay = this.toggleVROverlay.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  toggleVROverlay() {
    this.setState({
      vrOverlay: !this.state.vrOverlay,
    });
  }

  goHome() {
    // TODO: switch camera to orthographic?
    router.navigate('/');
  }

  render() {
    const {
      vr = false,
      mute = false,
      addRoom = false,
      about = false,
      close = false,
    } = this.props;
    return (
      <div>
        { this.state.about && <About onClose={this.toggleAbout} />}
        { this.state.vrOverlay && <EnterVROverlay /> }
        <Align type="top-left" rows>
          { about && <ButtonAbout onClick={this.toggleAbout} /> }
          { mute && <ButtonMute /> }
        </Align>
        <Align type="bottom-right">
          { vr && <ButtonEnterVR label toggleVROverlay={this.toggleVROverlay} /> }
          { addRoom && <ButtonAddRoom label /> }
        </Align>
        {
          close && (
            <Align type="top-right">
              <ButtonClose onClick={this.goHome} />
            </Align>
          )
        }
      </div>
    );
  }
}
