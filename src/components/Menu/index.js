/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
    this.goHome = this.goHome.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(props, { presenting }) {
    if (presenting === this.context.presenting) return;
    this.setState({
      enterVROVerlay: presenting,
    });
    if (presenting) {
      setTimeout(() => {
        this.setState({
          enterVROVerlay: false,
        });
      }, 5000);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
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

  toggleVR() {
    if (!feature.hasVR) {
      this.toggleNoVROverlay();
    } else {
      viewer.toggleVR();
    }
  }

  goHome() {
    viewer.exitPresent();
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
      enterVROVerlay,
    },
  ) {
    return (
      <div className="menu">
        { enterVROVerlay
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
              <span>Learn more</span>
            </a> or <a onClick={this.toggleNoVROverlay}>
              <span>continue watching without VR</span>
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
