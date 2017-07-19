import settings from '../../settings';

const numberWords = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

export default (round) => (
  round === (settings.maxLayerCount - 1)
    ? 'last round'
    : `round ${numberWords[round] || (round + 1)}`
);
