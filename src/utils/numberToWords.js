const oneWords = [
  null, 'one', 'two', 'three',
  'four', 'five', 'six',
  'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen',
  'fifteen', 'sixteen',
  'seventeen', 'eighteen',
  'nineteen',
];

const tenWords = [
  null,
  null,
  'twenty',
];

const numberToWords = (num, tri = 0) => {
  let words = [];
  const remainder = Math.round((num * 0.001) - 0.5);
  const belowHundred = Math.round((num % 100) - 0.5);

  if (belowHundred < 20) {
    words.push(oneWords[belowHundred]);
  } else {
    const tens = Math.round((belowHundred / 10) - 0.5);
    const belowTen = belowHundred % 10;
    words.push(tenWords[tens], oneWords[belowTen]);
  }

  if (remainder > 0) {
    words.unshift(...numberToWords(remainder, tri + 1));
  }

  if (tri === 0) {
    words = words.filter((word) => !!word);
  }

  return words;
};

export default (num) => numberToWords(num).join(' ');
