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
