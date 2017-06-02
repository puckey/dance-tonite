import props from './props';
import viewer from './viewer';

const head = new THREE.Mesh();
head.geometry = props.head.geometry.clone();;
head.geometry.rotateY( Math.PI );
head.geometry.scale( 1.4, 1.4, 1.4 );
head.material = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0xffffff
});

let roomIndex;
let performanceIndex;

function mount(){
  viewer.scene.add( head );
}

function set( roomIndexIn, performanceIndexIn ){
  roomIndex = roomIndexIn;
  performanceIndex = performanceIndexIn;
}

function update( playlist, audio ){
  const room = playlist.rooms[ roomIndex ];
  if( room === undefined ){
    return;
  }

  const headPosition = room.getHeadPosition(performanceIndex, room.currentTime);
  if( isNaN( headPosition.x ) || isNaN( headPosition.y ) || isNaN( headPosition.z ) ){
    return;
  }

  const headOrientation = room.getHeadOrientation(performanceIndex, room.currentTime);

  head.position.copy( headPosition );
  head.quaternion.copy( headOrientation );
  // head.quaternion.w *= -1;
  // console.log( headRotation );

}

export default {
  mount, set, update
};
