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

import Room from '../../components/Room';
import Align from '../../components/Align';
import ButtonItem from '../../components/ButtonItem';
import ShareButtons from '../../components/ShareButtons';
import ThanksTimeline from '../../components/ThanksTimeline';
import audio from '../../audio';
import viewer from '../../viewer';
import settings from '../../settings';

import transition from '../../transition';

export default class Submission extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'Loading performance…',
    };

    this.shareURL = {
      googlePlus: 'https://plus.google.com/share?url=',
      twitter: 'https://twitter.com/intent/tweet?text=',
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    };

    this.onRoomLoadError = this.onRoomLoadError.bind(this);
    this.gotoCreateGif = this.gotoCreateGif.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
    audio.fadeOut();
  }

  onRoomLoadError() {
    window.location = '/'; // If the room was deleted, redirect to homepage
  }

  gotoCreateGif() {
    this.props.goto('gif');
  }

  async asyncMount() {
    viewer.exitPresent();
    transition.reset();
    viewer.fog.near = settings.maxCullDistance;
    viewer.fog.far = settings.maxCullDistance;
  }

  render({ roomId, id, fromRecording }) {
    return (
      <div className="submission">
        <Room
          roomId={roomId}
          id={id}
          orbs
          onRoomLoadError={this.onRoomLoadError}
        >
          <ThanksTimeline fromRecording={fromRecording} />
        </Room>
        <Align type="bottom-right">
          <ButtonItem
            text={fromRecording
              ? `Watch yourself in the
full experience`
              : 'Watch in full experience'
            }
            onClick={this.props.onGotoFullExperience}
            underline
          />
        </Align>
        { fromRecording &&
          <ShareButtons roomId={roomId} id={id}>
            <ButtonItem text="Create animated GIF" onClick={this.gotoCreateGif} underline />
          </ShareButtons>
        }
      </div>
    );
  }
}
