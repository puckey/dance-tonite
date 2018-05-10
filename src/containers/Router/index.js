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

import router from '../../router';
import audio from '../../audio';
import feature from '../../utils/feature';
import audioPool from '../../utils/audio-pool';
import nosleep from '../../utils/nosleep';
import viewer from '../../viewer';
import transition from '../../transition';
import layout from '../../room/layout';
import settings from '../../settings';

import NotFound from '../NotFound';
import PressPlayToStart from '../PressPlayToStart';

const componentByRoute = require(`./routes-${
  process.env.FLAVOR === 'cms' ? 'cms' : 'website'
}`).default;

componentByRoute['/*'] = NotFound;

let animationStarted = false;

const convertParams = (params) => {
  if (params.roomId) {
    params.roomId = parseInt(params.roomId, 10);
  }
  if (params.hideHead) {
    params.hideHead = /no/.test(params.hideHead);
  }
};

export default class Router extends Component {
  constructor() {
    super();
    // For all devices we need a touch event in order
    // to play the audio:
    this.state = {
      needsFillPool: true,
      presenting: viewer.vrEffect.isPresenting,
    };
    this.setNotFound = this.setNotFound.bind(this);
    this.performFillPool = this.performFillPool.bind(this);
    this.onRouteChanged = this.onRouteChanged.bind(this);
    this.setPresenting = this.setPresenting.bind(this);
  }

  getChildContext() {
    return { presenting: this.state.presenting };
  }

  componentWillMount() {
    viewer.on('vr-present-change', this.setPresenting);
    Object
      .keys(componentByRoute)
      .forEach((route) => router.get(route, this.onRouteChanged));
  }

  onRouteChanged(req = {}, event) {
    const { params } = req;
    if (event && event.parent()) return;
    transition.exit();

    convertParams(params);
    if (this.state.route) {
      audio.fadeOut();
    }

    let notFound;
    const { roomId } = params;
    if (roomId !== undefined &&
      (
        layout.playlistIndexToMegaGridIndex(roomId - 1) === -1 ||
        layout.insideMegaGrid(layout.playlistIndexToMegaGridIndex(roomId - 1))
      )
    ) {
      notFound = 'The selected room id is invalid.';
    }

    this.setState({
      route: event.route,
      params,
      notFound,
    });
  }

  setPresenting(presenting) {
    this.setState({ presenting });
  }

  setNotFound(notFound) {
    this.setState({ notFound });
  }

  performFillPool() {
    // Stop mobile devices from going to sleep:
    nosleep.enable();
    audioPool.fill();
    this.setState({
      needsFillPool: false,
    });
  }

  render(props, { route, params, notFound, needsFillPool }) {
    if (!animationStarted && !needsFillPool) {
      viewer.startAnimating();
      animationStarted = true;
    }
    const RouteComponent = componentByRoute[route];
    return (
      needsFillPool
        ? (
          <PressPlayToStart
            onClick={this.performFillPool}
          />
        )
        : notFound
          ? <NotFound error={notFound} />
          : (
            <RouteComponent
              {...params}
              onNotFound={this.setNotFound}
            />
          )
    );
  }
}
