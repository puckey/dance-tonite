import firebaseConnection from './connection';

const serverURL = 'https://us-central1-you-move-me.cloudfunctions.net/';
//const serverURL = 'http://localhost:5002/you-move-me/us-central1/';

// getDraftPlaylist:
// cms.getDraftPlaylist().then((data) => { console.log('getDraftPlaylist!', data); });
const getDraftPlaylist = () =>
      firebaseConnection.contactServer(`${serverURL}getDraftPlaylist`, {});

// updateDraftPlaylist:
// cms.updateDraftPlaylist(3, 'adsf').then((data) => { console.log('update', data); });
const updateDraftPlaylist = (roomID, recordingID) =>
      firebaseConnection.contactServer(`${serverURL}updateDraftPlaylist`, { room: roomID, id: recordingID });

// publishDraftPlaylist:
// cms.publishDraftPlaylist().then((data) => { console.log('publishDraftPlaylist!', data); });
const publishDraftPlaylist = () =>
      firebaseConnection.contactServer(`${serverURL}publishDraftPlaylist`, {});

// getUnmoderatedRecordings:
// cms.getUnmoderatedRecordings().then((data) => { console.log('data', data); });
const getUnmoderatedRecordings = () =>
      firebaseConnection.contactServer(`${serverURL}getUnmoderatedRecordings`, {});

// getRecording:
// cms.getRecording('EamZtQ').then((data) => { console.log('getRecording!', data); });
const getRecording = (id) =>
      firebaseConnection.contactServer(`${serverURL}getRecording`, { id: id });

// updateRecording:
// cms.updateRecording('EamZtQ','hello there',1,false).then((data) => { console.log(data); });
//    if title, rating, or isUniversal are left null, they're value will not be changed
//    isUniversal is a boolean
//    rating:
//       0 = unrated
//       1 = good (star)
//      -1 = not good
const updateRecording = (id, title, rating, isUniversal) =>
      firebaseConnection.contactServer(`${serverURL}updateRecording`,
         { id: id, title: title, rating: rating, is_universal: isUniversal });

const firebaseCMS = {
  getDraftPlaylist: getDraftPlaylist,
  updateDraftPlaylist: updateDraftPlaylist,
  publishDraftPlaylist: publishDraftPlaylist,
  getUnmoderatedRecordings: getUnmoderatedRecordings,
  getRecording: getRecording,
  updateRecording: updateRecording,
};

export default firebaseCMS;
