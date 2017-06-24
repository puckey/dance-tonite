/** @jsx h */
import { h } from 'preact';
import './style.scss';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default function InformationOverlay({ children }) {
  return (
    <div className="information-overlay" onClick={this.props.onClose}>
      <Align type="top-right">
        <ButtonClose onClick={this.props.onClose} />
      </Align>
      <div className="information-overlay-text">
        {children}
      </div>
    </div>
  );
}
