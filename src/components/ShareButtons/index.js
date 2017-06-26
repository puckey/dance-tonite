/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Align from '../../components/Align';
import Twitter from '../../components/Twitter';
import Facebook from '../../components/Facebook';
import GooglePlus from '../../components/GooglePlus';

export default class Submission extends Component {
  constructor() {
    super();

    this.shareURL = {
      googlePlus: 'https://plus.google.com/share?url=',
      twitter: 'https://twitter.com/intent/tweet?text=',
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
    };

    this.shareToGooglePlus = this.share.bind(this, 'googlePlus');
    this.shareToFacebook = this.share.bind(this, 'facebook');
    this.shareToTwitter = this.share.bind(this, 'twitter');
  }

  componentWillUpdate() {
    return false;
  }

  share(service) {
    window.open(
      `${this.shareURL[service]}${this.props.deepLink}`,
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
  }

  render({ deepLink }) {
    return (
      <Align type="bottom-left">
        <p className="share-labels">Share</p>
        <div className="share-icons">
          <GooglePlus onClick={this.shareToGooglePlus} />
          <Twitter onClick={this.shareToTwitter} />
          <Facebook onClick={this.shareToFacebook} />
        </div>
        <p className="share-labels">
          <a href={deepLink}>{deepLink}</a>
        </p>
      </Align>
    );
  }
}
