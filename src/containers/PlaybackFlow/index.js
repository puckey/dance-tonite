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

import Menu from '../../components/Menu';
import CMSMenu from '../../components/CMSMenu';
import Container from '../../components/Container';
import Playback from '../Playback';
import Submission from '../Submission';
import CreateGIF from '../CreateGIF';

import recording from '../../recording';
import feature from '../../utils/feature';

import analytics from '../../utils/analytics';

export default class PlaybackFlow extends Component {
  constructor({ roomId }) {
    super();
    const hasRoomId = roomId !== undefined;
    const fromRecording = recording.exists() && hasRoomId;

    this.state = {
      mode: 'playback',
      fromRecording,
      count: 0,
    };
    this.performGotoFullExperience = this.performGotoFullExperience.bind(this);
    this.performGotoSubmission = this.performGotoSubmission.bind(this);
    this.setMode = this.setMode.bind(this);
  }

  setMode(mode) {
    this.setState({ mode });
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  performGotoFullExperience() {
    const { roomId, id } = this.props;
    window.location = `/${roomId}/${id}/`;
  }

  performGotoSubmission() {
    this.setState({
      mode: 'submission',
    });
    analytics.recordSectionChange('Submission');
  }

  renderMenu() {
    const { fromRecording, mode } = this.state;
    const { presenting } = this.context;
    return process.env.FLAVOR === 'cms'
      ? <CMSMenu
        vr
        audio
        mute
        submissions
        inbox
        publish
      />
      : (presenting && feature.vrPolyfill)
        ? <Menu
          close={this.performExitPresent}
        />
        : (
          fromRecording || /submission|gif/.test(mode)
            ? <Menu about mute />
            : <Menu vr addRoom about mute />
      );
  }

  render(
    props,
    { mode, fromRecording }
  ) {
    return (
      <Container>
        { this.renderMenu() }
        {
          mode === 'playback'
            ? <Playback
              {...props}
              inContextOfRecording={fromRecording}
              onGotoSubmission={this.performGotoSubmission}
              colophon={!fromRecording}
            />
            : mode === 'gif'
              ? <CreateGIF
                {...props}
                inContextOfRecording={fromRecording}
                goBack={this.performGotoSubmission}
              />
              : <Submission
                {...props}
                goto={this.setMode}
                fromRecording={fromRecording}
                onGotoFullExperience={this.performGotoFullExperience}
              />
        }
      </Container>
    );
  }
}
