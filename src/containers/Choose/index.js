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
import hud from '../../hud';

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
    const { room } = this.props;
    const { data, error } = await cms.getAvailableRecordings(room);
    if (!this.mounted) return;
    if (error) {
      this.setState({ error });
      return;
    }
    const { universal, forRoom } = data;
    universal.forEach(recording => {
      recording.room = room;
      recording.title = `${recording.title} - U`;
    });
    this.setState({
      loading: 'draft playlist',
    });
    const { data: playlistData, error: playlistError } = await cms.getDraftPlaylist(room);
    if (!this.mounted) return;
    if (playlistError) {
      this.setState({ error: playlistError });
      return;
    }
    const activeId = playlistData.playlist[room - 1].id;

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
    hud.showLoader('Saving room...');
    const { item } = this.state;
    const { error } = await cms.updateDraftPlaylist(item);
    if (error) {
      this.setState({ error });
      return;
    }
    router.navigate(`/${item.room}`);
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
        <Align type="bottom-right">
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
