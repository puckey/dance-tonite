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

import audio from '../../audio';
import viewer from '../../viewer';
import Room from '../../room';
import settings from '../../settings';
import layout from '../../room/layout';
import feature from '../../utils/feature';
import recording from '../../recording';

import Align from '../Align';
import Spinner from '../Spinner';
import RecordOrbs from '../RecordOrbs';

const state = {};

export default class RoomComponent extends Component {
  constructor() {
    super();

    this.state = {
      loading: false,
    };

    this.performOrbLeftRoom = this.performOrbLeftRoom.bind(this);
    this.performOrbEnteredRoom = this.performOrbEnteredRoom.bind(this);
    this.receiveOrb = this.receiveOrb.bind(this);
    this.tick = this.tick.bind(this);
    this.onRoomLoaded = this.onRoomLoaded.bind(this);
  }

  getChildContext() {
    return this.state;
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount(this.props);
  }

  componentWillReceiveProps(props, { presenting }) {
    if (presenting !== this.context.presenting && !presenting) {
      viewer.switchCamera('orthographic');
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.updateProjectionMatrix();
      Room.rotate180();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.camera.position.copy(state.originalCameraPosition);
    viewer.camera.zoom = state.originalZoom;
    viewer.camera.updateProjectionMatrix();
    audio.fadeOut();
    if (this.state.room) {
      this.state.room.destroy();
    }
    viewer.camera.position.y = 0;
    viewer.camera.updateProjectionMatrix();
    viewer.off('tick', this.tick);
  }

  onRoomLoaded(err) {
    this.setState({ loading: false });
    audio.dim(true);
    audio.play();

    if (err && this.props.onRoomLoadError) {
      this.props.onRoomLoadError(err);
    } else if (this.props.onRoomLoaded) {
      this.props.onRoomLoaded(err);
    }
  }

  async asyncMount({
    roomId,
    id,
    record,
    presenting,
    morph,
    progressive,
    fadeOrbs = true,
  }) {
    Room.reset();
    state.originalCameraPosition = viewer.camera.position.clone();
    state.originalZoom = viewer.camera.zoom;
    if (!record && !presenting) {
      viewer.switchCamera('orthographic');
      viewer.camera.position.y = 2;
      viewer.camera.position.z = 1.3;
      viewer.camera.updateProjectionMatrix();
      Room.rotate180();
    }

    this.setState({ loading: true });
    await audio.load({
      src: `${settings.assetsURL}sound/room-${roomId}.${feature.isChrome ? 'ogg' : 'mp3'}`,
      loops: 2,
      loopOffset: 0.5,
      progressive,
    });
    if (!this.mounted) return;

    const room = new Room({
      id,
      index: roomId - 1,
      single: true,
      showFrontWall: true,
      recording: record ? recording : null,
      morph,
    });
    if (fadeOrbs) {
      room.changeColorToWaiting();
    }

    audio.pause();

    if (id) {
      room.load(this.onRoomLoaded);
    } else {
      this.setState({ loading: false });
    }
    this.setState({ room });
    viewer.on('tick', this.tick);
  }

  performOrbLeftRoom() {
    if (!this.state.room) return;
    this.state.room.changeColorToWaiting();

    const { onOrbLeftRoom } = this.props;
    if (onOrbLeftRoom) {
      onOrbLeftRoom();
    }
  }

  performOrbEnteredRoom() {
    const { room } = this.state;
    if (!room) return;
    room.changeColorToRecording();

    const { onOrbEnteredRoom } = this.props;
    if (onOrbEnteredRoom) {
      onOrbEnteredRoom();
    }
  }

  receiveOrb(orb) {
    this.setState({ orb });
  }

  tick() {
    const { tutorialLayers } = this.props;
    const layers = tutorialLayers !== undefined
      ? Math.max(Math.floor((audio.totalProgress % 6) * 0.5) + 1, tutorialLayers)
      : null;
    this.state.room.gotoTime(audio.time, layers, this.props.highlightLast);
  }

  render({ orbs, fadeOrbs = true }, { loading }) {
    return (
      <div>
        {orbs &&
          <RecordOrbs
            fade={fadeOrbs}
            onEnteredRoom={fadeOrbs && this.performOrbEnteredRoom}
            onLeftRoom={fadeOrbs && this.performOrbLeftRoom}
            onEarlyLeftRoom={() => audio.dim()}
            onEarlyEnteredRoom={() => audio.undim()}
            onCreatedOrb={this.receiveOrb}
            reversed={this.props.reverseOrbs}
          />
        }
        <Align type="center">
          { loading && <Spinner /> }
        </Align>
        {this.props.children}
      </div>
    );
  }
}
