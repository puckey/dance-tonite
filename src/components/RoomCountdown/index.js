/** @jsx h */
import { h } from 'preact';

import './style.scss';

import numberToWords from '../../utils/numberToWords';
import capitalize from '../../utils/capitalize';

export default ({ target, current }) => {
  const left = target - current;
  return left >= 0 && (
    <div className="room-countdown">
      {
        current < 1
        ? 'Your friend’s room is coming up…'
        : target === current
          ? 'Your friend’s room!'
          : `${capitalize(numberToWords(left))} room${left > 1 ? 's' : ''} to go…`
      }
    </div>
  );
};
