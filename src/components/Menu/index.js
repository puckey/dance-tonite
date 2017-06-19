/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import router from '../../router';

import Align from '../../components/Align';
import ButtonMute from '../../components/ButtonMute';
import ButtonEnterVR from '../../components/ButtonEnterVR';
import ButtonAbout from '../../components/ButtonAbout';
import ButtonAddRoom from '../../components/ButtonAddRoom';
import ButtonClose from '../../components/ButtonClose';
import About from '../../components/About';

export default class Menu extends Component {
  constructor() {
    super();
    this.state = {
      about: false,
    };
    this.toggleAbout = this.toggleAbout.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  toggleAbout() {
    this.setState({
      about: !this.state.about,
    });
  }

  goHome() {
    // TODO: switch camera to orthographic?
    router.navigate('/');
  }

  render() {
    const {
      enterVR = true,
      addRoom = true,
      about = true,
      mute = true,
    } = this.props;
    return (
      <div>
        { this.state.about && <About onClose={this.toggleAbout} />}
        <Align type="top-left" rows>
          { about && <ButtonAbout onClick={this.toggleAbout} /> }
          { mute && <ButtonMute /> }
        </Align>
        <Align type="bottom-right">
          { enterVR && <ButtonEnterVR label /> }
          { addRoom && <ButtonAddRoom label /> }
        </Align>
        {
          close && (
            <Align type="top-right">
              <ButtonClose onClick={this.goHome} />
            </Align>
          )
        }
      </div>
    );
  }
}
