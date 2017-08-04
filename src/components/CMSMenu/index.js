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

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonInbox from '../../components/ButtonInbox';
import ButtonSubmissions from '../../components/ButtonSubmissions';
import ButtonPublish from '../../components/ButtonPublish';
import ButtonClose from '../../components/ButtonClose';
import EnterVROverlay from '../../components/EnterVROverlay';
import AudioControls from '../../components/AudioControls';

import viewer from '../../viewer';
import feature from '../../utils/feature';

export default class CMSMenu extends Component {
  constructor() {
    super();
    this.state = {
      vrOverlay: false,
    };
    this.toggleVR = this.toggleVR.bind(this);
  }

  componentWillReceiveProps(props, { presenting }) {
    if (presenting === this.context.presenting) return;
    this.setState({
      enterVROVerlay: presenting,
    });
  }

  toggleVR() {
    if (feature.hasVR) {
      viewer.toggleVR();
    }
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
      <div className="cms-menu">
        { this.state.vrOverlay
          ? <EnterVROverlay />
          : null
        }
        <Align type="top-left" margin rows>
          {vr ? <ButtonEnterVR onClick={this.toggleVR} /> : null}
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
