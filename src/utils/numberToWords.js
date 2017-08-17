/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
