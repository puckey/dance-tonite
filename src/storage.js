//import UniqueS3Uploader from 'unique-s3-uploader';
import firebaseUploader from './utils/firebase-uploader';
import fetch from 'unfetch';

const persist = (json) => new Promise((resolve, reject) => {
  /*
  new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/')
    .upload(json, (error, data) => {
      if (error) return reject(error);
      resolve(data.uri);
    });
    */
    const roomID = 1;
    firebaseUploader.upload(json, roomID, (error, data) => {
      if (error) return reject(error);
      resolve(data.uri);
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
