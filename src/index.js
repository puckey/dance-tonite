import 'babel-polyfill';

import './theme/index.scss';
import * as THREE from './lib/three';
import { installRouter } from './routes';
import props from './props';
import feature from './utils/feature';
import Room from './room';
import hud from './hud';
import viewer from './viewer';
import audioPool from './utils/audio-pool';
import playIconSvg from './hud/icons/play.svg';
import firebaseUploader from './utils/firebase-uploader';

window.THREE = THREE;


function migrateJSON(filename){
  var request = new XMLHttpRequest();
  request.open('GET', 'https://d1nylz9ljdxzkb.cloudfront.net/' + filename, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      //var data = JSON.parse(request.responseText);
      //var data = JSON.parse(request.responseText);
      var jsonString = request.responseText;
      //console.log("got it!");

      const roomID = 20;
      firebaseUploader.upload(jsonString, roomID, (error, data) => {
        if (error) console.log("ERROR!", error)
        else console.log("file uploaded!", data)
      });

    } 
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send();
}

// "1030619202368-bd491815.json?first",
// "1030183816095-9085ceb6.json?explosion",
// "1030261510603-8bad2f3c.json?drummer",
// "1030262646806-72cfa2a3.json?standing up",
// "1030280695249-75f03b49.json?marching",
// "1030279610994-2050ebff.json?flies",
// "1030184941183-3d4bb76a.json?campfire",
// "1030187137836-f4c0f1c7.json?flying hands",
// "1030276578477-8a79e35e.json?tunnel",
// "1030233234037-23f0590f.json?jeff squares",
// "1030231817998-689babac.json?jeff walk away",
// "1030273435171-f4249b52.json?lonely guy",
// "1030186081791-7bcb248c.json?gym",
// "1030272393550-2e080727.json?wave",
// "1030280166957-2a4309b8.json?backs to camera hands up on aaaah",
// "1030271006837-49c6eea7.json?plants",
// "1030185553157-56f65baf.json?dance",
// "1030232691136-bb71947f.json?intense spin",
// "1030270623237-5c8ea55e.json?line Dance",
// "1030270406489-28f04589.json?thriller",
// "1030270289280-52e9762b.json?end"

migrateJSON('1030272393550-2e080727.json')


(async () => {
  await Promise.all([
    props.prepare(),
    feature.prepare().then(hud.prepare),
  ]);

  // If we are on a mobile device, we need a touch event in order
  // to play the audio:
  if (feature.isMobile) {
    hud.hideLoader();
    Room.reset();
    viewer.switchCamera('orthographic');
    await new Promise((resolve) => {
      const play = hud.create('div.loader-overlay', hud.create('div.play-button.mod-fill', {
        onclick: function () {
          play.classList.add('mod-hidden');
          audioPool.fill();
          resolve();
        },
      }), hud.create('div.play-button-text', 'Press play to Dance Tonite'));
      document.querySelector('.play-button').innerHTML = playIconSvg;
    });
  }

  const { aboutButton, muteButton } = hud.elements;
  aboutButton.classList.remove('mod-hidden');
  muteButton.classList.remove('mod-hidden');

  installRouter();
})();
