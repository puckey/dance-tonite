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

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import CreateGIF from '../CreateGIF';
import Gallery from '../Gallery';
import router from '../../router';

export default class PlaybackFlow extends Component {
  constructor() {
    super();
    this.gotoGalleryEntry = this.gotoGalleryEntry.bind(this);
  }

  gotoGalleryEntry() {
    router.navigate(`/gallery/${this.props.id}`);
  }
  render(props) {
    return (
      <Container>
        <Menu close mute about />
        {
          props.gif
            ? <CreateGIF
              {...props}
              goBack={this.gotoGalleryEntry}
            />
            : <Gallery {...props} />
        }
      </Container>
    );
  }
}
