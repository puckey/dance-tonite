import UniqueS3Uploader from 'unique-s3-uploader';
import fetch from 'unfetch';

const persist = (json) => new Promise((resolve, reject) => {
  new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/')
    .upload(json, (error, data) => {
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
