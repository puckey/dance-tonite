/** @jsx h */
import { h } from 'preact';
import './style.scss';
import feature from '../../utils/feature';

export default () =>
  <div className="record-label">
    <span className="record-blinker">•</span>
    POV CAM{ !feature.isMobile && 'ERA'}
  </div>;
