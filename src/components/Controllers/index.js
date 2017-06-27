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
