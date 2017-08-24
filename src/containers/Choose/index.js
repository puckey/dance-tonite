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

import cms from '../../utils/firebase/cms';

import CMSMenu from '../../components/CMSMenu';
import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';
import router from '../../router';

export default class Choose extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'room choices',
    };
    this.performChangeItem = this.performChangeItem.bind(this);
    this.performSave = this.performSave.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async asyncMount() {
    const { roomId } = this.props;
    const { data, error } = await cms.getAvailableRecordings(roomId);
    if (!this.mounted) return;
    if (error) {
      this.setState({ error });
      return;
    }
    const { universal, forRoom } = data;
    universal.forEach(recording => {
      recording.room = roomId;
      recording.title = `${recording.title} - U`;
    });
    this.setState({
      loading: 'draft playlist',
    });
    const { data: playlistData, error: playlistError } = await cms.getDraftPlaylist(roomId);
    if (!this.mounted) return;
    if (playlistError) {
      this.setState({ error: playlistError });
      return;
    }
    const activeId = playlistData.playlist[roomId - 1].id;

    const items = []
      .concat(forRoom)
      .concat(
        // Filter out duplicates:
        universal.filter(
          universalRoom => !forRoom.find(
            recording => recording.id === universalRoom.id
          )
        )
      );
    let item = items.find(recording => recording.id === activeId);

    items.forEach(recording => {
      const days = Math.floor(recording.days_featured);
      const hours = Math.floor(recording.days_featured % 1 * 24);
      recording.title = `${recording.title} - ${days}d ${hours}h`;
    });

    // If the active item was not to be found in the available recordings,
    // retrieve it from the cms using getRecording and add it to the items array
    // manually:
    if (!item) {
      const { data: recordingData, error: recordingError } = await cms.getRecording(activeId);
      if (!this.mounted) return;
      if (recordingError) {
        this.setState({ error: recordingError });
        return;
      }
      item = recordingData;
      items.unshift(recordingData);
    }
    this.setState({
      item,
      items,
      loading: null,
    });
  }

  performChangeItem(item) {
    this.setState({ item });
  }

  async performSave() {
    this.setState({
      loading: 'Saving room...',
    });
    const { item } = this.state;
    const { error } = await cms.updateDraftPlaylist(item);
    if (error) {
      this.setState({ error });
      return;
    }
    router.navigate('/');
  }

  render({ room }, { items, item, error, loading }) {
    return (
      <Container>
        <CMSMenu
          vr
          mute
          submissions
          inbox
          close
        />
        <Align type="bottom-right" margin>
          <PaginatedList
            item={item}
            items={items}
            performChange={this.performChangeItem}
          />
          <a
            onClick={this.performSave}
          >Save & Close</a>
        </Align>
        {
          (item)
            ? (
              <Room
                id={item.id}
                roomId={item.room}
                key={item && item.id}
                orbs
              />
            )
            : (
              <Align type="center">
                { error
                  ? <Error>{error}</Error>
                  : <Spinner
                    text={`Loading ${loading || 'something'}`}
                  />
                }
              </Align>
            )
        }
      </Container>
    );
  }
}
