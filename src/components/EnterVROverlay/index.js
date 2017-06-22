/** @jsx h */
import { h } from 'preact';
import './style.scss';

export default function EnterVROverlay() {
  return (
    <div className="vr-info-overlay mod-entering-vr">
      <div className="vr-info-overlay-text">
        Put on your VR headset
      </div>
    </div>
  );
}
