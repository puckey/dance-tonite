/** @jsx h */
import { h } from 'preact';

import './style.scss';

import numberToWords from '../../utils/numberToWords';
import capitalize from '../../utils/capitalize';

export default ({ target, current, color }) => {
  const left = target - current;
  return left >= 0 && (
    <div className="room-countdown">
      {
        current < 1
        ? `Stay tuned for the shared performance in room ${target}.`
        : target === current
          ? `The shared performance is in the ${color} room.`
          : `${capitalize(numberToWords(left))} room${left > 1 ? 's' : ''} to go…`
      }
    </div>
  );
};
