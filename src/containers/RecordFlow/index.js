/** @jsx h */
import { h, Component } from 'preact';

import Tutorial from '../Tutorial';
import Record from '../Record';
import Review from '../Review';

import TutorialOverlay from '../../components/TutorialOverlay';

import router from '../../router';

const modes = ['tutorial', 'record', 'review'];

export default class RecordFlow extends Component {
  constructor() {
    super();
    this.state = {
      mode: 'tutorial',
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

  revealOverlay() {
    // this.setState({
    //   overlay: true,
    // });
  }

  render(
    props,
    { mode, overlay }
  ) {
    return (
      <div className="record-flow">
        { overlay && <TutorialOverlay/> }
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
      </div>
    );
  }
}
