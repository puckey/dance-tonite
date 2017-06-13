/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import cms from '../../../../utils/firebase/cms';

import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Close from '../../components/Close';
import Mute from '../../components/Mute';
import EnterVR from '../../components/EnterVR';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';
import router from '../../../../router';
import hud from '../../../../hud';

export default class Choose extends Component {
  constructor() {
    super();
    this.state = {
      loading: 'room choices',
    };
    this.changeItem = this.changeItem.bind(this);
    this.saveAndClose = this.saveAndClose.bind(this);
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

  changeItem(item) {
    this.setState({ item });
  }

  async saveAndClose() {
    hud.showLoader('Saving room...');
    await cms.updateDraftPlaylist(this.state.item);
    router.navigate(`/${this.state.item.room}`);
  }

  render({ room, goHome }, { items, item, error, loading }) {
    return (
      <Container>
        <Align type="top-left" row>
          <EnterVR /><Mute />
        </Align>
        <Align type="bottom-right">
          <PaginatedList
            item={item}
            items={items}
            performChange={this.changeItem}
          />
          <a className="mod-pointer" onClick={this.saveAndClose}>Save &amp; Close</a>
        </Align>
        <Align type="top-right">
          <Close
            onClick={goHome}
          />
        </Align>
        {
          (item)
            ? (
              <Room
                recording={item}
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
