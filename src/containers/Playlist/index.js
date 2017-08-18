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
import asyncEach from 'async/eachLimit';

import './style.scss';

import Room from '../../room';
import audio from '../../audio';
import viewer from '../../viewer';
import storage from '../../storage';
import layout from '../../room/layout';
import Orb from '../../orb';
import settings from '../../settings';
import transition from '../../transition';
import router from '../../router';
import feature from '../../utils/feature';
import Frames from '../../room/frames';
import { getRoomColorByIndex } from '../../theme/colors';

import BackgroundTimeline from '../../components/BackgroundTimeline';
import RoomLabels from '../../components/RoomLabels';
import POV from '../../components/POV';
import Align from '../../components/Align';
import RoomCountdown from '../../components/RoomCountdown';
import AutoCull from '../../components/AutoCull';

export default class Playlist extends Component {
  constructor() {
    super();
    this.state = {
      rooms: [],
    };
    this.orb = new Orb();
    this.tick = this.tick.bind(this);
  }

  componentWillMount() {
    this.mounted = true;
    // Do all this in the next frame, to hide the initial play button on mobile faster
    setTimeout(() => {
      Room.reset();
      Room.rotate180();
      const { recording, pathRoomId, orb } = this.props;
      const { rooms } = this.state;
      this.orb.visible = !!orb;

      if (recording) {
        for (let index = 1; index < 18; index += 2) {
          const room = new Room({
            recording,
            index,
            colorIndex: pathRoomId - 1,
            showFrontWall: true,
            showBackWall: true,
          });
          rooms.push(room);
        }
      }

      this.moveOrb(0);

      this.asyncMount();
      viewer.on('tick', this.tick);
    });
  }

  componentWillReceiveProps({ orb, stopped }) {
    this.orb.visible = !!orb;
    if (stopped) {
      viewer.off('tick', this.tick);
    }
  }

  componentWillUnmount() {
    this.orb.destroy();
    this.state.rooms.forEach((room) => room.destroy());
    viewer.off('tick', this.tick);
  }

  async asyncMount() {
    const { pathRecordingId, pathRoomId, recording } = this.props;
    if (recording) return;

    const entries = this.entries = await storage.loadPlaylist();
    if (!this.mounted) return;

    const rooms = this.state.rooms;

    let pathRecordingExists;
    if (pathRecordingId) {
      pathRecordingExists = await Frames.testUrl(pathRecordingId);
      if (!this.mounted) return;
    }

    for (let i = 0; i < entries.length; i++) {
      const isPathRecording = pathRecordingExists && i === pathRoomId - 1;
      const entry = entries[i];
      if (!entry) continue;
      const room = new Room({
        id: isPathRecording
          ? pathRecordingId
          : process.env.FLAVOR === 'cms'
            ? entry.id
            : entry,
        index: i,
        showFrontWall: layout.hasFrontWall(i),
        showBackWall: layout.hasBackWall(i),
        showRoom: layout.hasRoom(i),
        pathRecording: isPathRecording,
      });
      rooms.push(room);
    }

    this.setState({ entries, rooms });

    await new Promise((resolve) => {
      const destroyedErrorName = 'playlist destroyed';
      asyncEach(
        this.state.rooms,
        4,
        (room, callback) => {
          // If destroyed, callback with error to stop loading further files:
          if (this.destroyed) {
            return callback(Error(destroyedErrorName));
          }
          room.load(callback);
        },
        (error) => {
          if (error && error.name !== destroyedErrorName) {
            if (this.props.onError) this.props.onError(error);
          }
          resolve();
        },
      );
    });
  }

  moveOrb(progress) {
    const position = layout.getPosition(progress + 0.5);
    position.y += settings.holeHeight;
    position.z *= -1;
    this.orb.position.copy(position);
  }

  tick() {
    if (!this.state.rooms || transition.isInside()) return;
    const currentRoomID = audio.progress > 0.7 && Math.floor(audio.progress) - 1;
    if (this.state.currentRoomID !== currentRoomID) {
      this.setState({ currentRoomID });
    }
    this.moveOrb(audio.progress || 0);

    for (let i = 0; i < this.state.rooms.length; i++) {
      const room = this.state.rooms[i];
      let time = Math.min(audio.time, settings.dropTime);
      if (layout.isEven(room.index)) {
        time += settings.loopDuration;
      }
      room.gotoTime(time % (settings.loopDuration * 2));
    }
  }

  navigateToChooser(room) {
    router.navigate(`/choose/${room.index}/`);
  }

  render(
    { recording, stopped, orb, pathRoomId, hideRoomCountdown },
    { rooms, entries, currentRoomID }
  ) {
    return (
      <div>
        {!stopped && <POV
          enterHeads={process.env.FLAVOR !== 'cms'}
          totalProgress={this.props.totalProgress}
          fixedControllers={this.props.fixedControllers}
          // When reviewing a recording, start closer to the rooms:
          offset={recording ? 2 : 0}
          rooms={rooms}
          orb={orb && this.orb}
        />
        }
        {
          !hideRoomCountdown && pathRoomId !== undefined && currentRoomID > 0 && (
            <Align type="bottom-left">
              <RoomCountdown target={pathRoomId} current={currentRoomID} color={getRoomColorByIndex(pathRoomId - 1).name} />
            </Align>
          )
        }
        {
          (process.env.FLAVOR === 'cms' && !viewer.vrEffect.isPresenting)
          ? <RoomLabels
            rooms={rooms}
            entries={entries}
          />
          : null
        }
        <AutoCull />
        { !stopped && <BackgroundTimeline /> }
      </div>
    );
  }
}
