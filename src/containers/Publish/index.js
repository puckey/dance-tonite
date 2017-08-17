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

import Error from '../../components/Error';
import Spinner from '../../components/Spinner';
import CMSMenu from '../../components/CMSMenu';
import Align from '../../components/Align';
import Container from '../../components/Container';

import router from '../../router';
import { sleep } from '../../utils/async';

export default class Publish extends Component {
  componentDidMount() {
    this.mounted = true;
    this.asyncMount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async asyncMount() {
    this.setState({
      loading: 'Publishing draft playlist…',
    });
    await sleep(1000);
    if (!this.mounted) return;

    const { error } = await cms.publishDraftPlaylist();
    if (!this.mounted) return;

    if (error) {
      this.setState({ error });
    } else {
      this.setState({
        loading: 'Playlist published…',
      });
      await sleep(2000);
      if (!this.mounted) return;

      this.setState({
        loading: 'Redirecting to homepage…',
      });
      await sleep(2000);
      if (!this.mounted) return;
      router.navigate('/');
    }
  }

  render({ room }, { error, loading }) {
    return (
      <Container>
        <CMSMenu
          vr
          mute
          submissions
          inbox
          close
        />
        <Align type="center">
          { error
            ? <Error>{error}</Error>
            : <Spinner text={loading} />
          }
        </Align>
      </Container>
    );
  }
}
