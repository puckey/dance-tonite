import { queryData } from './utils/url';
import streamJSON from './lib/stream-json';
import feature from './utils/feature';
import Frame from './frame';

const PROTOCOL = location.protocol;

export default class Frames {
  constructor(url, recording) {
    this.fps = 90;
    if (recording) {
      this.frames = recording.frames;
      this.hideHead = recording.hideHead;
    }
    if (url) {
      this.url = (url.indexOf('?') === -1) ? url : url.split('?')[0];
    }
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
      `${PROTOCOL}//storage.googleapis.com/you-move-me.appspot.com/recordings/${this.url}/${
        `${queryData.fps || (feature.has6DOF ? 45 : 15)}FPS.json`
      }`,
      (error, json) => {
        if (error || !json) {
          if (callback) {
            return callback(error);
          }
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
