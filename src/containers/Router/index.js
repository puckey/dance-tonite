/** @jsx h */
import { h, Component } from 'preact';

import router from '../../router';
import audio from '../../audio';
import settings from '../../settings';
import feature from '../../utils/feature';
import audioPool from '../../utils/audio-pool';
import viewer from '../../viewer';

import NotFound from '../NotFound';
import PressPlayToStart from '../PressPlayToStart';

const componentByRoute = require(`./routes-${
  process.env.FLAVOR === 'cms' ? 'cms' : 'website'
}`).default;

componentByRoute['/*'] = NotFound;

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
    // If we are on a mobile device, we need a touch event in order
    // to play the audio:
    this.state = {
      needsFillPool: feature.isMobile,
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
    convertParams(params);
    if (this.state.route) {
      audio.reset();
    }

    let notFound;
    if (params.roomId &&
        params.roomId > settings.roomCount ||
        params.roomId < 1
    ) {
      notFound = 'Sorry, but the room id provided is invalid.';
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
    audioPool.fill();
    this.setState({
      needsFillPool: false,
    });
  }

  render(props, { route, params, notFound, needsFillPool }) {
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
