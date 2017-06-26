/** @jsx h */
import { h, Component } from 'preact';

import Menu from '../../components/Menu';
import Container from '../../components/Container';
import Tutorial from '../Tutorial';
import Record from '../Record';
import Review from '../Review';
import router from '../../router';
import audio from '../../audio';

const modes = ['tutorial', 'record', 'review'];

export default class RecordFlow extends Component {
  constructor() {
    super();
    this.state = {
      mode: 'tutorial',
      overlay: false,
      count: 0,
    };
    this.goto = this.goto.bind(this);
    this.revealOverlay = this.revealOverlay.bind(this);
  }

  goto(mode) {
    audio.reset();
    const count = this.state.count + 1;
    if (modes.indexOf(mode) === -1) {
      router.navigate(mode);
    } else {
      this.setState({ mode, count });
    }
  }

  revealOverlay(type) {
    this.setState({
      overlay: type,
    });
  }

  render(
    props,
    { mode, overlay, count }
  ) {
    return (
      <Container>
        <Menu
          about
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
              key={count}
            />
            : mode === 'review'
              ? <Review {...props} goto={this.goto} key={count} />
              : <Record {...props} goto={this.goto} key={count} />
        }
      </Container>
    );
  }
}
