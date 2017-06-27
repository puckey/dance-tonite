let connection;

const getConnection = () => (
  new Promise((resolve) => {
    if (connection) return resolve(connection);
    require.ensure([], function (require) {
      connection = require('./connection').default;
      resolve(connection);
    });
  })
);

import convertFPS from '../convertFPS';

const requestUploadToken = (roomID) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}getUploadToken`, { room: roomID })
);

const uploadDataString = (dataString, filename, uploadToken) => {
  const promise = new Promise((resolve, reject) => {
    const targetFileRef = connection.firebase.storage().ref().child(`_incoming/${filename}`);

    // metadata we want to store with the file
    const metadata = {
      contentType: 'application/json',
      customMetadata: {
        token: uploadToken,
      },
    };

    const uploadTask = targetFileRef.putString(dataString, undefined, metadata);

    uploadTask.on('state_changed', () => { // progress
      // uploadTask.on('state_changed', (snapshot) => { // progress
      // const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // console.log('Upload is ' + progress + '% done');
      // TODO: emit upload progress events
    }, (error) => { // error
      reject(error);
    }, () => { // complete
      resolve(uploadTask.snapshot.downloadURL);
    });
  });

  return promise;
};

const startSubmissionProcessing = (token) => getConnection().then(
  () => connection.contactServer(`${connection.serverURL}processSubmission`, { token })
);

const firebaseUploader = {
  upload: async (roomData, roomID, callback) => {
    // Request an upload token
    const { data: uploadToken, error: requestError } = await requestUploadToken(roomID);
    if (requestError) return callback(requestError);
    const { uri_array, token } = uploadToken;
    // Wait for all uploads to complete
    await Promise.all(
      uri_array.map(([fps, filename]) => (
        uploadDataString(
          (
            fps === 90
              ? roomData
              : convertFPS(roomData, fps)
          ).map(JSON.stringify).join('\n'),
          filename,
          token
        )
      ))
    );

    // now process files
    const { data: submission, error: processingError } = await startSubmissionProcessing(token);
    if (processingError) return callback(processingError);
    // file processing is done, the recording is saved!
    callback(null, submission.id);
  },
};

export default firebaseUploader;
