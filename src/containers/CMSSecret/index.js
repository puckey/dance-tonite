/** @jsx h */
import { h, Component } from 'preact';

import './style.scss';

import Container from '../../components/Container';

import CMSMenu from '../../components/CMSMenu';
import Align from '../../components/Align';

export default class FirebaseKey extends Component {
  constructor() {
    super();
    this.state = {
      secret: localStorage.getItem('secret'),
    }
    this.keyInputChanged = this.keyInputChanged.bind(this);
    this.performSave = this.performSave.bind(this);
  }

  performSave() {
    localStorage.setItem('secret', this.state.secret);
    this.setState({
      secretChanged: false,
    });
    this.forceUpdate();
  }

  keyInputChanged(event) {
    const secret = event.target.value;
    this.setState({
      secret,
      secretChanged: secret !== localStorage.getItem('secret'),
    });
  }

  render() {
    const { secret, secretChanged } = this.state;
    return (
      <Container>
        <CMSMenu
          vr
          mute
          submissions
          inbox
          close
        />
        <Align type="center" margin>
          <div>CMS authorization key</div>
          <input
            placeHolder="Enter key"
            type="text"
            className="secret-input"
            onInput={this.keyInputChanged}
            size="40"
            value={secret}
          />
          {secretChanged && (
            <div className="secret-go-home"><a onClick={this.performSave}>Save</a></div>
          )}
        </Align>
      </Container>
    );
  }
}
