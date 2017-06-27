/** @jsx h */
import { h } from 'preact';
import './style.scss';
import feature from '../../utils/feature';

export default function EnterVROverlay() {
  return !feature.vrPolyfill && (
    <div className="vr-info-overlay mod-entering-vr">
      <div className="vr-info-overlay-text">
        Put on your VR headset
      </div>
    </div>
  );
}
