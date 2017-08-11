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
import { queryData } from '../utils/url';
import streamJSON from '../../third_party/puckey_utils/stream-json';
import feature from '../utils/feature';
import Frame from './frame';

const PROTOCOL = location.protocol;

const getURL = (id) => (
  `${PROTOCOL}//storage.googleapis.com/you-move-me.appspot.com/recordings/${id}/${
    `${queryData.dataRate || (feature.has6DOF ? 45 : 15)}FPS.json`
  }`
);

export default class Frames {
  constructor(id, recording) {
    this.fps = 90;
    if (recording) {
      this.frames = recording.frames;
      this.hideHead = recording.hideHead;
      this.count = recording.count;
      this.complete = true;
    }
    this.id = id;
  }

  cancel() {
    if (this.streamer) {
      this.streamer.cancel();
    }
  }

  getFrame(seconds) {
    return new Frame(this, seconds);
  }

  load(callback) {
    const frames = this.frames = [];
    let meta;
    this.streamer = streamJSON(
      getURL(this.id),
      (error, json) => {
        if (error || !json) {
          if (callback) {
            if (!error) {
              this.complete = true;
            }
            callback(error);
          }
          return;
        }
        if (!meta) {
          // First JSON is meta object:
          meta = JSON.parse(json);
          this.hideHead = meta.hideHead;
          this.count = meta.count;
          if (meta.fps) {
            this.fps = meta.fps;
          }
        } else {
          frames.push(json);
        }
      }
    );
  }
}

Frames.testUrl = (id) => new Promise((resolve) => {
  const request = new XMLHttpRequest();
  request.open('GET', getURL(id), true);
  request.onreadystatechange = () => {
    if (request.status) {
      resolve(request.status < 400);
      request.abort();
    }
  };
  request.send();
});
