/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonAbout from '../../components/ButtonAbout';
import ButtonAddRoom from '../../components/ButtonAddRoom';
import About from '../../components/About';

export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      about: false,
    };
    this.toggleAbout = this.toggleAbout.bind(this);
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  render() {
    return (
      <div>
        { this.state.about && <About onClose={this.toggleAbout} />}
        <Align type="top-left" rows>
          <ButtonAbout onClick={this.toggleAbout} />
          <ButtonMute />
        </Align>
        <Align type="bottom-right">
          <ButtonEnterVR label />
          <ButtonAddRoom label />
        </Align>
      </div>
    );
  }
}
