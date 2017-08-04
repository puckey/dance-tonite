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
export default (country) => {
  return country.split('').map(function (d) {
    const value = d.charCodeAt(0) + 127397 - 0x10000;
    return String.fromCharCode(value >>> 10 & 0x3FF | 0xD800) + String.fromCharCode(0xDC00 | value & 0x3FF);
  }).join('');
}