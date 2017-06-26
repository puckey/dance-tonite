/** @jsx h */
import { h } from 'preact';
import './style.scss';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default function Overlay({ children }) {
  return (
    <div className="overlay" onClick={this.props.onClose}>
      <Align type="top-right">
        <ButtonClose onClick={this.props.onClose} />
      </Align>
      <div className="overlay-text">
        {children}
      </div>
    </div>
  );
}
