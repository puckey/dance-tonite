//import UniqueS3Uploader from 'unique-s3-uploader';
import firebaseUploader from './utils/firebase-uploader';
import fetch from 'unfetch';

const persist = (data) => new Promise((resolve, reject) => {
  /*
  new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/')
    .upload(json, (error, data) => {
      if (error) return reject(error);
      resolve(data.uri);
    });
    */
    const roomID = 1;
    firebaseUploader.upload(data, roomID, (error, data) => {
      if (error) return reject(error);
      resolve(data);
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
