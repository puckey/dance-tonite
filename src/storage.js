import fetch from 'unfetch';
import shuffle from 'just-shuffle';

import cms from './utils/firebase/cms';
import firebaseUploader from './utils/firebase/uploader';
import layout from './room/layout';
import settings from './settings';

const persist = (data, roomID) => new Promise((resolve, reject) => {
  firebaseUploader.upload(data, roomID, (error, recordingID) => {
    if (error) return reject(error);
    resolve(recordingID);
  });
});

const loadGallery = async () => {
  const response = await fetch(`${settings.playlistsUrl}gallery.json`);
  const entries = await response.json();
  return entries;
};

const loadPlaylist = async () => {
  if (process.env.FLAVOR === 'cms') {
    const { data } = await cms.getDraftPlaylist();
    const { playlist } = data;
    if (playlist.length > settings.roomCount) {
      playlist.length = settings.roomCount;
    }
    return playlist;
  }

  if (process.env.FLAVOR !== 'cms') {
    const response = await fetch(`${settings.playlistsUrl}playlist.json`);
    const { playlist, megagrid } = await response.json();
    shuffle(megagrid);
    playlist.length = settings.roomCount;
    const extra = [];
    for (let i = 0, l = layout.roomCount - playlist.length; i < l; i++) {
      extra.push(megagrid[i % megagrid.length]);
    }
    shuffle(extra);
    return playlist.concat(extra);
  }
};

export default {
  persist, loadPlaylist, loadGallery,
};
