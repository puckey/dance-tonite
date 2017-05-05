import * as THREE from './lib/three';

export function configureRenderer( renderer ){
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

export const shadowLight = new THREE.DirectionalLight(0x000000);
shadowLight.castShadow = true;

const { shadow, position, target:t } = shadowLight;
const { position:target } = t;

export const shadowTarget = shadowLight.target;

export const helper = new THREE.CameraHelper( shadow.camera );

shadow.camera.near    = 0.01;
shadow.camera.far     = 2.4;
shadow.camera.updateProjectionMatrix();
setPosition( 0, 2, 0 );
setShadowProfile( 'orthographic' );

function setPosition( x, y, z ){
  if( x === undefined ){
    x = position.x;
  }
  if( y === undefined ){
    y = position.y;
  }
  if( z === undefined ){
    z = position.z;
  }
  position.set( x, y, z );
  target.set( x, 0, z );
}

let zOffset = 1.05;

export function setShadowProfile( name ){
  const { shadow } = shadowLight;
  if( name === 'orthographic' ){
    // console.log( 'setting shadow profile to orthographic' );
    zOffset = 1.05;
    // setPosition( -0.25, 2, 1.05 );
    updateShadowSize( 1024, 2048 );
    setShadowPlaneSize( 5, 10 );
  }
  else{
    // console.log( 'setting shadow profile to default' );
    zOffset = -1.225;
    // setPosition( 0, 2, -1.225 );
    updateShadowSize( 1024, 2048 );
    setShadowPlaneSize( 4, 8 );
  }
  shadow.camera.updateProjectionMatrix();
  helper.update();
}

function updateShadowSize( width, height ){
  if( shadow.map ){
    shadow.map.dispose();
    shadow.map = null;
  }
  shadow.mapSize.width = width;
  shadow.mapSize.height = height;
}

function setShadowPlaneSize( width, height ){
  shadow.camera.bottom = -height;
  shadow.camera.left   = -width;
  shadow.camera.top    = height;
  shadow.camera.right  = width;
}


export function updateFollow( camera ){
  setPosition( undefined, undefined, camera.position.z + zOffset );
  shadow.camera.updateProjectionMatrix();
  helper.update();
}