/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Tutorial from '../Tutorial';
import Record from '../Record';
import Review from '../Review';
import router from '../../router';

const modes = ['tutorial', 'record', 'review'];

export default class RecordFlow extends Component {
  constructor() {
    super();
    this.state = {
      mode: 'tutorial',
      overlay: false,
    };
    this.goto = this.goto.bind(this);
    this.revealOverlay = this.revealOverlay.bind(this);
  }

  goto(mode) {
    if (modes.indexOf(mode) === -1) {
      router.navigate(mode);
    } else {
      this.setState({ mode });
    }
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  render(
    props,
    { mode, overlay }
  ) {
    return (
      <Container>
        <Menu
          mute
          close
          overlay={overlay}
          goto={this.goto}
        />
        {
          mode === 'tutorial'
            ? <Tutorial
              {...props} goto={this.goto}
              revealOverlay={this.revealOverlay}
            />
            : mode === 'review'
              ? <Review {...props} goto={this.goto} />
              : <Record {...props} goto={this.goto} />
        }
      </Container>
    );
  }
}
