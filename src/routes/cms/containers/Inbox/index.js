/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Close from '../../components/Close';
import Mute from '../../components/Mute';
import EnterVR from '../../components/EnterVR';
import InboxCounter from '../../components/InboxCounter';

export default class Choose extends Component {
  constructor() {
    super();
    this.state = {
      starred: false,
    };

    this.toggleStarred = this.toggleStarred.bind(this);
  }

  toggleStarred() {
    this.setState({
      starred: !this.state.starred,
    });
  }

  render({ roomId, recordingId, goHome, unreadCount }, { starred }) {
    return (
      <Container>
        <Align type="top-left row">
          <InboxCounter unreadCount={unreadCount} />
          <EnterVR />
          <Mute />
        </Align>
        <Align type="bottom-right">
          <div
            className="inbox-menu-item"
            onClick={this.toggleStarred}
          >
            { starred ? 'Unstar' : 'Star' }
          </div>
          { starred &&
            <input
              autoFocus
              placeHolder="Performance Title"
              type="text"
              className="inbox-title-input"
              id="performanceTitle"
            />
          }
          <div className="inbox-menu-item">Next &rarr;</div>
        </Align>
        <Align type="top-right">
          <Close
            onClick={goHome}
          />
        </Align>
        {
          roomId === undefined
            ? (
              <Align type="center">
                <Error>Room not defined</Error>
              </Align>
            )
            : <Room loopIndex={roomId} recordingId={recordingId} />
        }
      </Container>
    );
  }
}
