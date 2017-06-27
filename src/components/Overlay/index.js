/** @jsx h */
import { h } from 'preact';
import './style.scss';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default function Overlay({ children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <Align type="top-right">
        <ButtonClose onClick={onClose} />
      </Align>
      <div className="overlay-text">
        {children}
      </div>
    </div>
  );
}
