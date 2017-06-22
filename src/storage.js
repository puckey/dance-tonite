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

const loadPlaylist = async () => {
  if (process.env.FLAVOR !== 'cms') {
    const response = await fetch('https://storage.googleapis.com/you-move-me.appspot.com/playlists/playlist.json');
    const { playlist, megagrid } = await response.json();
    console.log(playlist);
    shuffle(megagrid);
    playlist.length = settings.roomCount;
    const extra = [];
    for (let i = 0, l = layout.roomCount - playlist.length; i < l; i++) {
      extra.push(megagrid[i % megagrid.length]);
    }
    shuffle(extra);
    return playlist.concat(extra);
  }

  const { data } = await cms.getDraftPlaylist();
  const { playlist } = data;
  console.log(JSON.stringify(playlist.map(({ id }) => id)));
  if (playlist.length > settings.roomCount) {
    playlist.length = settings.roomCount;
  }
  return playlist;
};

export default {
  persist, loadPlaylist,
};
