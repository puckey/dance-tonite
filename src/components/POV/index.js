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

import viewer from '../../viewer';
import createPov from '../../pov';
import audio from '../../audio';
import Align from '../Align';
import RecordBlinker from '../RecordBlinker';

export default class POV extends Component {
  constructor() {
    super();
    this.state = {
      inPOV: false,
    };
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    this.pov = createPov(this.props);
    if (this.props.enterHeads) {
      this.pov.setupInput();
    }
    viewer.on('tick', this.tick);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.off('tick', this.tick);
    this.pov.removeInput();
  }

  tick() {
    const progress = this.props.totalProgress
      ? audio.totalProgress
      : audio.progress;
    this.pov.update(progress, !!this.props.fixedControllers);

    const inPOV = this.pov.isInPOV();
    if (this.state.inPOV !== inPOV) {
      this.setState({ inPOV });
    }
  }

  render() {
    return this.state.inPOV ? (
      <Align type="top-right">
        <RecordBlinker />
      </Align>
    ) : null;
  }
}
