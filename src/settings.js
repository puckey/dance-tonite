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
import { queryData } from './utils/url';

export default {
  // Room dimensions:
  roomDepth: 6,
  roomHeight: 6,
  roomWidth: 5,

  // The amount to offset the recording within the room:
  roomOffset: -0.2 * 6,

  // Room holes:
  holeHeight: 1.6,
  holeRadius: 0.18,

  sphereRadius: 0.18 * 0.9,

  // The amount of loops that can be recorded:
  loopCount: 28,

  roomCount: 19,

  // The maximum amount of layers allowed in recording mode:
  maxLayerCount: 20,

  // The total amount of loops contained in the playback file:
  totalLoopCount: 29,

  playlistsUrl: 'https://storage.googleapis.com/you-move-me.appspot.com/playlists/',

  colorTimes: [
    184.734288, 186.80405, 188.837803, 190.804763, 191.688472, 192.238635,
    192.820638, 194.788529, 196.83769, 198.822996, 199.722769, 200.289696,
    200.806389, 202.840048, 204.790524, 206.671341, 207.190921, 207.722044,
    208.191224, 208.491519, 208.824357, 210.824968, 212.807214, 216.824266,
  ],

  dropTime: 216.624266,

  loopDuration: 8,

  shouldCull: (queryData.cull === undefined) ? true : queryData.cull, // URL?cull=false
  cullDistance: 18,
  minCullDistance: 18,
  maxCullDistance: 48,

  useShadow: (queryData.shadows === undefined) ? true : queryData.shadows, // URL?shadows=false

  maxPixelRatio: queryData.dpr || 4, // URL?dpr=1

  stats: /fps/.test(window.location.hash) || queryData.fps, // URL#fps or URL?fps=1

  assetsURL: 'https://storage.googleapis.com/you-move-me.appspot.com/assets/',

  logging: (queryData.log === undefined) ? false : queryData.log, // URL?log=1
};
