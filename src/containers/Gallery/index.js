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
import storage from '../../storage';

import './style.scss';

import Room from '../../components/Room';
import Error from '../../components/Error';
import Align from '../../components/Align';
import Title from '../../components/Title';
import PaginatedList from '../../components/PaginatedList';
import Spinner from '../../components/Spinner';
import ButtonItem from '../../components/ButtonItem';

import router from '../../router';
import getFontSize from '../../utils/font-size';
import windowSize from '../../utils/windowSize';
import feature from '../../utils/feature';
import settings from '../../settings';
import countryCodeToEmoji from '../../utils/countryCodeToEmoji';

export default class Gallery extends Component {
  constructor() {
    super();
    this.state = { };
    this.performSelect = this.performSelect.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.gotoGIF = this.gotoGIF.bind(this);
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
    if (!this.mounted) return;

    recordings = recordings
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter(({ room }) => room > 0);

    const items = recordings
      .map(({ title, id, country_code }, index) => ({
        index,
        id,
        title: `- ${title || 'Unnamed'} ${countryCodeToEmoji(country_code)}`,
      }));
    const item = recordingId ? items.find(it => it.id === recordingId) : items[0];
    this.setState({
      items,
      recordings,
      item,
      recording: recordings[item ? item.index : 0],
      loading: null,
    });
  }

  gotoGIF() {
    const { recording } = this.state;
    router.navigate(`/gallery/${recording.id}/${recording.room}/gif`);
  }

  async performSelect(item) {
    router.navigate(`/gallery/${this.state.recordings[item.index].id}`);
  }

  render(
    { room, goHome },
    { items, item, recording, error, loading }
  ) {
    return (
      <div>
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
            progressive={feature.isIOs}
            orbs
            morph
          />
          : null
        }
        {
          (recording && !feature.isMobile)
          ? (
            <Align type="bottom-right" margin>
              <ButtonItem
                text={'Create GIF'}
                onClick={this.gotoGIF}
                underline
              />
            </Align>
          )
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
      </div>
    );
  }
}
