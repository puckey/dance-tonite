/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import router from '../../router';
import layout from '../../room/layout';

export default class RoomLabel extends Component {
  constructor() {
    super();
    this.toggleAbout = this.toggleAbout.bind(this);
    this.navigateToChooser = this.navigateToChooser.bind(this);
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  navigateToChooser(event) {
    router.navigate(`/choose/${layout.getPlaylistIndex(this.props.room.index) + 1}`);
    event.stopPropagation();
  }

  render({ entry, room }) {
    const days = Math.floor(entry.days_featured);
    const hours = Math.floor(entry.days_featured % 1 * 24);
    const title = entry.title === '' ? 'Unnamed' : entry.title;
    const featured = `Featured ${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 0 ? 's' : ''}`;
    const coords = room.getScreenCoordinates();
    return (
      <div
        className="room-label"
        key={title}
        style={{
          transform: `translate(${coords.x}px, ${coords.y}px)`,
        }}
        onClick={this.navigateToChooser}
      >
        <span>Room {layout.getPlaylistIndex(room.index) + 1}</span>
        <span className="wrap">{title}</span>
        <span className="new-line">{featured}</span>
      </div>
    );
  }
}
