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
import { Color } from '../../third_party/threejs/three';
import layout from '../room/layout';

const green = new Color(0x55b848);
const red = new Color(0xef4f36);
const orange = new Color(0xd19c20);
const purple = new Color(0xcc44b9);
const blue = new Color(0x40a598);
const pink = new Color(0xc95fbf);
const white = new Color(0xffffff);
const yellow = new Color(0xffff00);
const gray = new Color(0x646262);

// Quick fix for later calling out the color name.
green.name = 'green';
red.name = 'red';
orange.name = 'orange';
purple.name = 'purple';
blue.name = 'blue';
pink.name = 'pink';
white.name = 'white';
yellow.name = 'yellow';
gray.name = 'gray';

const pairs = ([
  [green, red],
  [orange, purple],
  [blue, red],
  [pink, orange],
  [red, blue],
  [green, purple],
  [orange, blue],
  [pink, green],
  [blue, orange],
  [green, red],
  [pink, blue],
  [red, orange],
]);

const pairCount = pairs.length;

const pairByRoomIndex = (roomIndex) => {
  const [x, y, z] = layout.getRoom(roomIndex);
  return pairs[(x + Math.ceil(Math.abs(y)) + z) % pairCount];
};

export const getRoomColor = roomIndex => pairByRoomIndex(roomIndex)[0];
export const getRoomColorByIndex = index => pairs[index % pairs.length][0];
export const getCostumeColor = roomIndex => pairByRoomIndex(roomIndex)[1];

export const recordCostumeColor = white;
export const waitRoomColor = gray;
export const orbColor = yellow;
export const highlightColor = white;
export const textColor = yellow;
export const controllerButtonColor = yellow;
export const backgroundColor = new Color(0x000000);
