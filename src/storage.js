import UniqueS3Uploader from 'unique-s3-uploader';
import fetch from 'unfetch';

const uploader = new UniqueS3Uploader('https://ymm-recorder.puckey.studio/new/');

const persist = (json, callback) => {
  uploader.upload(json, (error, data) => {
    if (error) return callback(error);
    callback(null, data.uri);
  });
};

const loadPlaylist = (filename, callback) => {
  fetch(`public/playlists/${filename}`).then(
    response => (response
      .json()
      .then((json) => {
        callback(null, json);
      })
    ),
  );
};

export default {
  persist, loadPlaylist,
};
