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
import cms from '../../../../utils/firebase/cms';
import router from '../../../../router';

export default class Inbox extends Component {
  constructor() {
    super();
    this.state = {
      starred: false,
    };

    this.toggleStarred = this.toggleStarred.bind(this);
  }

  async asyncMount() {
    const unread = await cms.getUnmoderatedRecordings();
    if (!this.mounted) return;
    if ((!this.props.recordingId || !this.props.roomId) && unread.length) {
      router.navigate(`/inbox/2/${unread[0].id}`);
      return;
    }

    this.setState({
      unreadCount: unread.length,
    });
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggleStarred() {
    this.setState({
      starred: !this.state.starred,
    });
  }

  render({ roomId, recordingId, goHome }, { starred, unreadCount }) {
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
          roomId == null
            ? (
              <Align type="center">
                <Error>Loading inbox</Error>
              </Align>
            )
            : <Room roomIndex={roomId} recordingId={recordingId} />
        }
      </Container>
    );
  }
}
