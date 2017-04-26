import UniqueS3Uploader from 'unique-s3-uploader';
import fetch from 'unfetch';

const uploader = new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/');

const persist = (json) => {
  return new Promise((resolve, reject) => {
    uploader.upload(json, (error, data) => {
      if (error) return reject(error);
      resolve(data.uri);
    });
  });
};

const loadPlaylist = async (filename, callback) => {
  const response = await fetch(`public/playlists/${filename}`);
  const data = await response.json();
  callback(null, data);
};

export default {
  persist, loadPlaylist,
};
