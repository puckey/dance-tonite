import fetch from 'unfetch';
import firebaseUploader from './utils/firebase/uploader';

const persist = (data, roomID) => new Promise((resolve, reject) => {
  firebaseUploader.upload(data, roomID, (error, recordingID) => {
    if (error) return reject(error);
    resolve(recordingID);
  });
});

const loadPlaylist = async (filename) => {
  const response = await fetch(`/public/playlists/${filename}`, {
    credentials: 'include',
  });
  const data = await response.json();
  return data;
};

export default {
  persist, loadPlaylist,
};
