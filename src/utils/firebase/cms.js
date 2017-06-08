// import cms from './utils/firebase/cms';
//
// cms.getUnmoderatedRecordings().then( (data) => { console.log("data!", data)});

import firebaseConnection from './connection';

const getUnmoderatedRecordingsURL = 'https://us-central1-you-move-me.cloudfunctions.net/getUnmoderatedRecordings';

const getUnmoderatedRecordings = () =>
      firebaseConnection.contactServer(getUnmoderatedRecordingsURL, {});


const firebaseCMS = {
  getUnmoderatedRecordings: getUnmoderatedRecordings,
};

export default firebaseCMS;
