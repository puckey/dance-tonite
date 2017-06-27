/** @jsx h */
import { Component } from 'preact';

import controllers from '../../controllers';

export default class Controllers extends Component {
  componentDidMount() {
    this.mounted = true;
    controllers.add();
    controllers.update(this.props.settings);
  }

  shouldComponentUpdate({ settings }) {
    if (settings !== this.props.settings) {
      controllers.update(settings);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    controllers.update(null);
    controllers.remove();
  }
}
