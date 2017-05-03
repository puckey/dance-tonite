import UniqueS3Uploader from 'unique-s3-uploader';
import fetch from 'unfetch';

const uploader = new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/');

const persist = (json) => new Promise((resolve, reject) => {
  uploader.upload(json, (error, data) => {
    if (error) return reject(error);
    resolve(data.uri);
  });
});

const loadPlaylist = async (filename) => {
  const response = await fetch(`/public/playlists/${filename}`);
  const data = await response.json();
  return data;
};

export default {
  persist, loadPlaylist,
};
