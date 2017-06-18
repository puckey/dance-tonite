/** @jsx h */
import { h, Component } from 'preact';

import controllers from '../../controllers';
import viewer from '../../viewer';

import RoomInstructions from '../RoomInstructions';

export default class ConnectControllers extends Component {
  constructor() {
    super();
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    viewer.events.on('tick', this.tick);
  }

  componentWillUnmount() {
    this.mounted = false;
    viewer.events.off('tick', this.tick);
  }

  tick() {
    const count = controllers.countActiveControllers();
    if (count === this.state.count) return;
    this.setState({ count });
    if (count === 2) {
      if (this.state.onConnected) this.state.onConnected();
    } else if (this.state.onDisconnected) {
      this.state.onDisconnected();
    }
  }

  render(props, { count }) {
    return (
      <RoomInstructions
        subtitle={
          count === 2
            ? 'press right controller to start'
            : count === 1
              ? 'turn on both of your controllers'
              : 'turn on your controllers\nthen press any button to begin'
        }
      />
    );
  }
}
