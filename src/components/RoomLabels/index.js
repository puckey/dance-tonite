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

import viewer from '../../viewer';

import RoomLabel from '../RoomLabel';

export default class RoomLabels extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
    this.roomToRoomLabel = this.roomToRoomLabel.bind(this);
    this.isVisibleOnScreen = room => room.isVisibleOnScreen();
  }

  componentDidMount() {
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.off('tick', this.tick);
  }

  tick() {
    this.setState({
      visibleRooms: this.props.rooms.filter(this.isVisibleOnScreen),
    });
  }

  roomToRoomLabel(room) {
    const { entries } = this.props;
    return entries && (
      <RoomLabel
        room={room}
        key={room.index}
        entry={entries[room.index]}
      />
    );
  }

  render(props, { visibleRooms }) {
    return visibleRooms && !viewer.vrEffect.isPresenting && (
      <div className="room-labels">
        { visibleRooms.map(this.roomToRoomLabel) }
      </div>
    );
  }
}
