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
import padNumber from 'pad-number';
import { debounce } from 'throttle-debounce';

import './style.scss';

import cms from '../../utils/firebase/cms';
import countryCodeToEmoji from '../../utils/countryCodeToEmoji';

import CMSMenu from '../../components/CMSMenu';
import POVRoom from '../../components/POVRoom';
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
    this.toggleBan = this.toggleBan.bind(this);
    this.performDelete = this.performDelete.bind(this);
    this.performBan = this.performBan.bind(this);
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
      loading: 'Submitting…',
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

  toggleBan(event) {
    this.setState({ banOverlay: !this.state.banOverlay });
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

  performBan() {
    this.setState({
      banning: true,
      banOverlay: false,
    }, async () => {
      await cms.banRecording(this.state.item.id);
      window.location = '/submissions';
    });
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
      .map((recording, index) => ({
        index,
        title: `${recording.is_universal ? '🌎 ' : padNumber(recording.room, 2)} – ${
          recording.rating !== 0
            ? recording.rating === -1
              ? '👎'
              : '⭐'
            : '🆕'} ${
          recording.is_megagrid_worthy ? '🎉' : ''
        } ${
          recording.title === '' ? 'Unnamed ' + new Date(recording.timestamp).toLocaleString() : recording.title
        } ${
          recording.location
            ? countryCodeToEmoji(recording.location.country_code)
            : ''
        } ${ 
          recording.days_featured <= 0 ? '' 
            : Math.floor(recording.days_featured) + 'd' + Math.floor(recording.days_featured % 1 * 24)+'h'
        }`
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
    { items, item, recording, error, loading, deleteOverlay, banOverlay, banning },
    { presenting }
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
        { banning &&
          <Overlay>
            <p>Banning recording. Please wait...</p>
          </Overlay>
        }
        { banOverlay &&
          <Overlay onClose={this.toggleBan}>
            <p>Ban {recording.title || recording.id}?</p>
            <p><a onClick={this.performBan}><span>Yes, ban this recording</span></a></p>
            <p><a onClick={this.toggleDtoggleBanelete}><span>No, I changed my mind</span></a></p>
          </Overlay>
        }
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
                  onClick={this.toggleBan}
                >Ban</a>
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
          recording &&
            <POVRoom
              id={recording.id}
              roomId={recording.room}
              presenting={presenting}
              onRoomLoadError={this.onRoomLoadError}
            />
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
