/** @jsx h */
import { h, Component } from 'preact';
import storage from '../../storage';

import './style.scss';

import Menu from '../../components/Menu';
import Room from '../../components/Room';
import Container from '../../components/Container';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Title from '../../components/Title';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';

import router from '../../router';
import getFontSize from '../../utils/font-size';
import windowSize from '../../utils/windowSize';
import feature from '../../utils/feature';
import settings from '../../settings';

export default class Gallery extends Component {
  constructor() {
    super();
    this.state = { };
    this.performSelect = this.performSelect.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
    windowSize.on('resize', this.onWindowResize);
  }

  componentWillReceiveProps({ id }) {
    const { items, recordings } = this.state;
    const item = items.find(it => it.id === id);
    this.setState({
      item,
      recording: recordings[item.index],
    });
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
    const { id: recordingId } = this.props;
    let recordings = await storage.loadGallery();
    recordings = recordings
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter(({ room }) => room > 0);

    const items = recordings
      .map(({ title, id }, index) => ({
        index,
        id,
        title: `- ${title || 'Unnamed'}`,
      }));
    if (!this.mounted) return;
    const item = recordingId ? items.find(it => it.id === recordingId) : items[0];
    this.setState({
      items,
      recordings,
      item,
      recording: recordings[item ? item.index : 0],
      loading: null,
    });
  }

  async performSelect(item) {
    router.navigate(`/gallery/${this.state.recordings[item.index].id}`);
  }

  render(
    { room, goHome },
    { items, item, recording, error, loading }
  ) {
    return (
      <Container>
        <Menu close mute about />
        <Title>{feature.isMobile ? 'Gallery' : 'Featured Performances'}</Title>
        <Align type="bottom-left" margin>
          <PaginatedList
            item={item}
            items={items}
            performChange={this.performSelect}
            itemsPerPage={Math.floor((windowSize.height * 0.3) / getFontSize())}
          />
        </Align>
        {
          recording
          ? <Room
            id={recording.id}
            roomId={1 + ((recording.room - 1) % settings.roomCount)}
            key={recording.id}
            progressive={feature.isMobile}
            orbs
            morph
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
