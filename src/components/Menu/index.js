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
import Overlay from '../../components/Overlay';
import EnterVROverlay from '../../components/EnterVROverlay';
import About from '../../components/About';
import viewer from '../../viewer';
import feature from '../../utils/feature';
import audio from '../../audio';

export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      about: false,
      noVROverlay: false,
      enteredVROverlay: false,
    };
    this.toggleAbout = this.toggleAbout.bind(this);
    this.toggleVR = this.toggleVR.bind(this);
    this.toggleNoVROverlay = this.toggleNoVROverlay.bind(this);
    this.toggleEnteredVROverlay = this.toggleEnteredVROverlay.bind(this);
    this.goHome = this.goHome.bind(this);
    this.isMounted = this.isMounted.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    viewer.on('vr-present-change', this.toggleEnteredVROverlay);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('vr-present-change', this.toggleEnteredVROverlay);
  }

  toggleEnteredVROverlay(isPresenting) {
    this.setState({
      enteredVROverlay: isPresenting === undefined
        ? !this.state.enteredVROverlay
        : isPresenting,
    });
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  toggleNoVROverlay(event) {
    if (event && event.target.target === '_blank') return;

    this.setState({
      noVROverlay: !this.state.noVROverlay,
    });

    audio[this.state.noVROverlay ? 'pause' : 'play']();

    if (event) {
      event.stopPropagation();
    }
  }

  isMounted() {
    return this.mounted;
  }

  toggleVR() {
    if (!feature.hasVR) {
      this.toggleNoVROverlay();
    } else {
      viewer.toggleVR(this.isMounted);
    }
  }

  goHome() {
    // TODO: switch camera to orthographic?
    router.navigate('/');
  }

  render(
    {
      vr = false,
      mute = false,
      addRoom = false,
      about = false,
      close = false,
    },
    {
      enteredVROverlay,
    }
  ) {
    return (
      <div className="menu">
        { enteredVROverlay
          ? <EnterVROverlay />
          : null
        }
        { this.state.about
          ? <About onClose={this.toggleAbout} />
          : null
        }
        { this.state.noVROverlay
          ? <Overlay
            goto={this.props.goto}
            onClose={this.toggleNoVROverlay}
          >
            <p>Headset required to watch in VR.</p>
            <a href="https://webvr.info" target="_blank" rel="noopener noreferrer">
              Learn more
            </a> or <a onClick={this.toggleNoVROverlay}>
              continue watching without VR
            </a>.
          </Overlay>
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
            ? <ButtonEnterVR label onClick={this.toggleVR} />
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
