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
    viewer.events.on('tick', this.tick);
  }

  componentWillUnmount() {
    viewer.events.off('tick', this.tick);
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
    return visibleRooms && !viewer.isPresentingVR() && (
      <div className="room-labels">
        { visibleRooms.map(this.roomToRoomLabel) }
      </div>
    );
  }
}
