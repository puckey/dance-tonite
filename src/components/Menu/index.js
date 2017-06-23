/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import router from '../../router';
import feature from '../../utils/feature';
import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonAbout from '../../components/ButtonAbout';
import ButtonAddRoom from '../../components/ButtonAddRoom';
import ButtonClose from '../../components/ButtonClose';
import InformationOverlay from '../../components/InformationOverlay';
import EnterVROverlay from '../../components/EnterVROverlay';
import About from '../../components/About';
import audio from '../../audio';

export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      about: false,
      enterVROverlay: false,
    };
    this.toggleAbout = this.toggleAbout.bind(this);
    this.toggleVROverlay = this.toggleVROverlay.bind(this);
    this.closeOverlay = this.closeOverlay.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  toggleVROverlay() {
    if (this.state.enterVROverlay === false && !feature.hasVR) {
      this.setState({
        overlay: 'no-vr',
      });
    } else {
      this.setState({
        enterVROverlay: !this.state.enterVROverlay,
      });
    }
  }

  closeOverlay() {
    audio.play();
    this.setState({
      overlay: false,
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
      overlay = false,
    } = this.props;
    return (
      <div className="menu">
        { this.state.about
          ? <About onClose={this.toggleAbout} />
          : null
        }
        {
          ((overlay || this.state.overlay) && !this.state.enterVROverlay)
            ? <InformationOverlay
              type={overlay || this.state.overlay}
              goto={this.props.goto}
              close={this.closeOverlay}
              toggleVROverlay={this.toggleVROverlay}
            />
            : null
        }
        { this.state.enterVROverlay
          ? <EnterVROverlay />
          : null
        }
        <Align type="top-left" rows>
          { about
            ? <ButtonAbout onClick={this.toggleAbout} />
            : null
          }
          { mute
            ? <ButtonMute />
            : null
          }
        </Align>
        <Align type="bottom-right">
          { vr
            ? <ButtonEnterVR label toggleVROverlay={this.toggleVROverlay} />
            : null
          }
          { addRoom
            ? <ButtonAddRoom label />
            : null
          }
        </Align>
        {
          close
            ? (
              <Align type="top-right">
                <ButtonClose onClick={close === true ? this.goHome : close} />
              </Align>
            )
            : null
        }
      </div>
    );
  }
}
