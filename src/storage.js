import UniqueS3Uploader from 'unique-s3-uploader';

const uploader = new UniqueS3Uploader('https://ymm-recorder.puckey.studio');

const persist = (json, callback) => {
  uploader.upload(json, (error, data) => {
    if (error) return callback(error);
    callback(null, data.uri);
  });
};

const load = (key, callback) => {
  fetch(`https://s3-eu-west-1.amazonaws.com/ymm-recorder/${key}`)
  .then(response => response.json())
  .then(data => callback(null, data));
};

const loadPlaylist = (filename, callback) => {
  fetch(`public/playlists/${filename}.json`).then(
    response => (response
      .json()
      .then((json) => {
        callback(null, json);
      })
    ),
  );
};

export default {
  load, persist, loadPlaylist,
};
