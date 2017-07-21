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
  let data;
  if (process.env.FLAVOR === 'cms') {
    const response = await cms.getDraftPlaylist();
    data = response.data;
  } else {
    const response = await fetch(`${settings.playlistsUrl}playlist.json`);
    data = await response.json();
  }
  const playlist = data.playlist;
  const megaGrid = data.megagrid
    ? shuffle(data.megagrid)
    : null;
  const list = [];
  let megaGridIndex = 0;
  for (let i = 0; i < layout.roomCount; i++) {
    const entry = layout.insideMegaGrid(i)
      ? megaGrid
        ? megaGrid[megaGridIndex++ % megaGrid.length]
        : null
      : playlist.shift();
    list.push(entry);
  }
  return list;
};

export default {
  persist, loadPlaylist, loadGallery,
};
