/** @jsx h */
import { h, Component } from 'preact';
import storage from '../../storage';

import './style.scss';

import Menu from '../../components/Menu';
import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';

import router from '../../router';
import getFontSize from '../../utils/font-size';
import windowSize from '../../utils/windowSize';
import settings from '../../settings';

export default class Submissions extends Component {
  constructor() {
    super();
    this.state = { };
    this.performSelect = this.performSelect.bind(this);
    this.performChangeItem = this.performChangeItem.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
    windowSize.on('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    this.mounted = false;
    windowSize.off('resize', this.onWindowResize);
  }

  onWindowResize() {
    this.forceUpdate();
  }

  async asyncMount() {
    this.setState({
      loading: 'Loading recordings…',
    });
    const { item } = this.state;
    const recordings = await storage.loadGallery();
    const items = recordings
      .filter(({ room }) => room > 0)
      .map(({ title }, index) => ({
        index,
        title: `- ${title || 'Unnamed'}`,
      }));
    if (!this.mounted) return;
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
    router.navigate(`/gallery/${item.id}`);
  }

  render(
    { room, goHome },
    { items, item, recording, error, loading }
  ) {
    return (
      <Container>
        <Menu close mute />
        <Align type="bottom-left" margin>
          <PaginatedList
            item={item}
            items={items}
            performChange={this.performChangeItem}
          />
        </Align>
        {
          recording
          ? <Room
            id={recording.id}
            roomId={1 + ((recording.room - 1) % settings.roomCount)}
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
