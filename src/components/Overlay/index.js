/** @jsx h */
import { h } from 'preact';
import classNames from 'classnames';

import './style.scss';
import Align from '../../components/Align';
import ButtonClose from '../../components/ButtonClose';

export default function Overlay({ children, onClose, opaque }) {
  return (
    <div
      className={classNames('overlay', opaque && 'mod-opaque')}
      onClick={onClose}
    >
      {onClose && (
        <Align type="top-right">
          <ButtonClose onClick={onClose} />
        </Align>
      )}
      <div className="overlay-text">
        {children}
      </div>
    </div>
  );
}
