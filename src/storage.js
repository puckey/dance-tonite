import fetch from 'unfetch';
import cms from './utils/firebase/cms';
import firebaseUploader from './utils/firebase/uploader';

const persist = (data, roomID) => new Promise((resolve, reject) => {
  firebaseUploader.upload(data, roomID, (error, recordingID) => {
    if (error) return reject(error);
    resolve(recordingID);
  });
});

const loadPlaylist = async () => {
  if (process.env.FLAVOR !== 'cms') {
    const response = await fetch('https://storage.googleapis.com/you-move-me.appspot.com/playlists/playlist.json', {
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  }
  const data = await cms.getDraftPlaylist();
  return data.playlist;
};

export default {
  persist, loadPlaylist,
};
