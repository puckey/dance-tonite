import UniqueS3Uploader from 'unique-s3-uploader';
import fetch from 'unfetch';

const uploader = new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/');

const persist = (json, callback) => {
  uploader.upload(json, (error, data) => {
    if (error) return callback(error);
    callback(null, data.uri);
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
