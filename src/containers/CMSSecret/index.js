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

import router from '../../router';

import Container from '../../components/Container';
import Align from '../../components/Align';

export default class FirebaseKey extends Component {
  constructor() {
    super();
    this.state = {
      secret: localStorage.getItem('secret'),
    };
    this.keyInputChanged = this.keyInputChanged.bind(this);
    this.performSave = this.performSave.bind(this);
  }

  performSave() {
    localStorage.setItem('secret', this.state.secret);
    this.setState({
      secretChanged: false,
    });
    router.navigate('/');
  }

  keyInputChanged(event) {
    const secret = event.target.value;
    this.setState({
      secret,
      secretChanged: secret !== localStorage.getItem('secret'),
    });
  }

  render() {
    const { secret, secretChanged } = this.state;
    return (
      <Container>
        <Align type="center" margin>
          <div>CMS authorization key</div>
          <input
            placeHolder="Enter key"
            type="text"
            className="secret-input"
            onInput={this.keyInputChanged}
            size="40"
            value={secret}
          />
          {secretChanged && (
            <div className="secret-go-home"><a onClick={this.performSave}>Save</a></div>
          )}
        </Align>
      </Container>
    );
  }
}
