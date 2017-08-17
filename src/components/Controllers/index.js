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
import { Component } from 'preact';

import deps from '../../deps';

export default class Controllers extends Component {
  componentDidMount() {
    this.mounted = true;
    deps.controllers.add();
    deps.controllers.update(this.props.settings);
  }

  shouldComponentUpdate({ settings }) {
    if (settings !== this.props.settings) {
      deps.controllers.update(settings);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    deps.controllers.update(null);
    deps.controllers.remove();
  }
}
