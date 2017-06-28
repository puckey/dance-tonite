/** @jsx h */
import { h, Component } from 'preact';
import './style.scss';

import Align from '../../components/Align';
import ButtonTwitter from '../../components/ButtonTwitter';
import ButtonFacebook from '../../components/ButtonFacebook';
import ButtonGooglePlus from '../../components/ButtonGooglePlus';
import analytics from '../../utils/analytics';

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
      `${this.shareURL[service]}${this.state.deepLink}`,
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
    if (service === 'googlePlus') analytics.recordSocialShare('Google+');
    else if (service === 'facebook') analytics.recordSocialShare('Facebook');
    else if (service === 'twitter') analytics.recordSocialShare('Twitter');
  }

  render({ roomId, id, children }) {
    const link = `/${roomId}/${id}/`;
    const deepLink = `https://tonite.dance${link}`;
    return (
      <Align type="bottom-left" margin>
        <div>Share your performance:</div>
        <div className="share-icons">
          <ButtonGooglePlus onClick={this.shareToGooglePlus} />
          <ButtonTwitter onClick={this.shareToTwitter} />
          <ButtonFacebook onClick={this.shareToFacebook} />
        </div>
        <a href={link}><span>{deepLink}</span></a>
        { children }
      </Align>
    );
  }
}
