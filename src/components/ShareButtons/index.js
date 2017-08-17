/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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

  componentWillMount() {
    const { roomId, id } = this.props;
    const link = `/${roomId}/${id}/`;
    this.setState({
      link,
      deepLink: `https://tonite.dance${link}`,
      description: `I'm in room ${roomId} of @LCDSoundsystem’s Dance Tonite `,
    });
  }

  componentWillUpdate() {
    return false;
  }

  share(service) {
    const description = service === 'twitter' ? this.state.description : '';
    window.open(
      `${this.shareURL[service]}${description}${this.state.deepLink}`,
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'
    );
    if (service === 'googlePlus') analytics.recordSocialShare('Google+');
    else if (service === 'facebook') analytics.recordSocialShare('Facebook');
    else if (service === 'twitter') analytics.recordSocialShare('Twitter');
  }

  render({ children }, { link, deepLink }) {
    return (
      <Align type="bottom-left" margin>
        <div>Share your killer moves:</div>
        <div className="share-icons">
          <ButtonGooglePlus onClick={this.shareToGooglePlus} />
          <ButtonTwitter onClick={this.shareToTwitter} />
          <ButtonFacebook onClick={this.shareToFacebook} />
        </div>
        <a href={link}>{deepLink}</a>
        { children }
      </Align>
    );
  }
}
