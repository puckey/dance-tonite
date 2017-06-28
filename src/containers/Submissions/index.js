/** @jsx h */
import { h, Component } from 'preact';
import padNumber from 'pad-number';
import { debounce } from 'throttle-debounce';

import './style.scss';

import cms from '../../utils/firebase/cms';

import CMSMenu from '../../components/CMSMenu';
import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';
import Overlay from '../../components/Overlay';

import router from '../../router';

export default class Submissions extends Component {
  constructor() {
    super();
    this.state = { };
    this.performChangeItem = this.performChangeItem.bind(this);
    this.performSelect = this.performSelect.bind(this);
    this.toggleStarred = this.toggleStarred.bind(this);
    this.titleInputChanged = this.titleInputChanged.bind(this);
    this.toggleUniversal = this.toggleUniversal.bind(this);
    this.toggleMegaGridWorthy = this.toggleMegaGridWorthy.bind(this);
    this.submit = this.submit.bind(this);
    this.updateTitle = debounce(300, this.updateTitle);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.performDelete = this.performDelete.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  titleInputChanged(event) {
    this.updateTitle(event.target.value);
  }

  async submit() {
    this.setState({
      loading: 'submitting',
    });
    const { error } = await cms.updateRecording(this.state.recording);
    if (!this.mounted) return;
    this.setState({
      loading: null,
    });
    if (error) {
      this.setState({ error });
    } else {
      this.asyncMount();
    }
  }


  toggleUniversal() {
    const { recording } = this.state;
    recording.is_universal = !recording.is_universal;
    this.setState({
      recording,
    });
  }

  updateTitle(title) {
    const { recording } = this.state;
    recording.title = title;
    recording.rating = (title && title.length) ? 1 : -1;
    this.setState({
      recording,
    });
  }

  toggleStarred() {
    const { recording } = this.state;
    recording.rating = recording.rating === 1 ? -1 : 1;
    this.setState({
      recording,
    });
  }

  toggleMegaGridWorthy() {
    const { recording } = this.state;
    recording.is_megagrid_worthy = !recording.is_megagrid_worthy;
    this.setState({
      recording,
    });
  }

  toggleDelete(event) {
    this.setState({ deleteOverlay: !this.state.deleteOverlay });
    if (event) {
      event.stopPropagation();
    }
  }

  performDelete() {
    const { recording } = this.state;
    recording.room = -recording.room;
    this.setState({
      recording,
    }, this.submit);
  }

  async asyncMount() {
    this.setState({
      loading: 'Loading recordings…',
    });
    const { item } = this.state;
    const { room } = this.props;
    let { data: recordings, error } = await cms.getAllRecordings(room);
    recordings = recordings
      .filter(recording => recording.room !== -1)
      .sort((a, b) => b.timestamp - a.timestamp);
    const items = recordings
      .map((recording, index) => Object.assign({
        index,
        title: `${recording.is_universal ? '🌎' : padNumber(recording.room, 2)} – ${
          recording.title === '' ? 'Unnamed' : recording.title} ${
          recording.rating !== 0
            ? recording.rating === -1
              ? '👎'
              : '⭐'
            : '🆕'} ${
          recording.is_megagrid_worthy ? '🎉' : ''
        }`,
      })
    );
    if (!this.mounted) return;
    if (error) {
      this.setState({ error });
      return;
    }
    this.setState({
      items,
      recordings,
      item: items[item ? item.index : 0],
      recording: recordings[item ? item.index : 0],
      loading: null,
    });
  }

  performChangeItem(item) {
    this.setState({
      item,
      recording: this.state.recordings[item.index],
    });
  }

  async performSelect() {
    const { item } = this.state;
    router.navigate(`/inbox/${item.id}`);
  }

  render(
    { room, goHome },
    { items, item, recording, error, loading, deleteOverlay }
  ) {
    return (
      <Container>
        <CMSMenu
          vr
          mute
          submissions
          inbox
          close
        />
        { deleteOverlay &&
          <Overlay onClose={this.toggleDelete}>
            <p>Delete {recording.title || recording.id}?</p>
            <p><a onClick={this.performDelete}><span>Yes, delete this recording</span></a></p>
            <p><a onClick={this.toggleDelete}><span>No, I changed my mind</span></a></p>
          </Overlay>
        }
        <Align type="bottom-left" margin>
          <PaginatedList
            item={item}
            items={items}
            performChange={this.performChangeItem}
            itemsPerPage={10}
          />
        </Align>
        {
          recording
            ? <Align type="bottom-right" margin>
              <input
                placeHolder="Performance title"
                type="text"
                className="inbox-title-input"
                id="performanceTitle"
                onInput={this.titleInputChanged}
                value={recording.title}
              />
              <div>Starred
                <input
                  type="checkbox"
                  checked={recording.rating === 1}
                  onChange={this.toggleStarred}
                />
              </div>
              <div>Universal
                <input
                  type="checkbox"
                  checked={recording.is_universal}
                  onChange={this.toggleUniversal}
                />
              </div>
              <div>Mega Grid Worthy
                <input
                  type="checkbox"
                  checked={recording.is_megagrid_worthy}
                  onChange={this.toggleMegaGridWorthy}
                />
              </div>
              <div className="submit-buttons">
                <a
                  className="submit-button"
                  onClick={this.toggleDelete}
                >Delete</a>
                <a
                  className="submit-button"
                  onClick={this.submit}
                >Save</a>
              </div>
            </Align>
          : null
        }
        {
          recording
          ? <Room
            id={recording.id}
            roomId={recording.room}
            key={recording && recording.id}
            orbs
          />
          : null
        }
        { (error || loading)
          ? <Align type="center">
            { error
              ? <Error>{error}</Error>
              : <Spinner
                text={`${loading || 'something'}`}
              />
            }
          </Align>
          : null
        }
      </Container>
    );
  }
}
