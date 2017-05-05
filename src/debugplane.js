import * as THREE from './lib/three';
import Settings from './settings';

const group = new THREE.Group();

const positions = [];

function mark( event ){

  event.target.matrixWorld.decompose(position, rotation, scale);
  positions.push( position.clone() );

  clear();
  draw();

  save();
}

function reset( event ){
  positions.length = 0;
  save();
  clear();
}

const lineMaterial = new THREE.LineBasicMaterial({color:Settings.textColor});
const groundLineMaterial = new THREE.LineBasicMaterial();
const extrudeMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0.3,
  blending: THREE.AdditiveBlending,
  color: 0xaabbff,
  side: THREE.DoubleSide
});
const pointsMaterial = new THREE.PointsMaterial({
  size: 0.01
});

let line;
let groundLine;
let extrudeMesh;
let points;

const outline = new THREE.Group();
outline.position.y = 0.1;
let outlineLine;

const position = new THREE.Vector3();
const rotation = new THREE.Quaternion();
const scale = new THREE.Vector3();

const extrudeHeight = 0.6;

function clear(){
  group.remove( line, extrudeMesh, points, groundLine );
}

function draw( outlineOnly ){

  const geometry = new THREE.Geometry();
  geometry.vertices.push( ...positions.map( function(p){
    var pc = new THREE.Vector3( p.x, 0, p.z );
    return pc;
  }) );
  if( positions.length > 2 ){
    geometry.vertices.push( geometry.vertices[0].clone() );
  }
  line = new THREE.Line( geometry, lineMaterial );
  group.add( line );

  outline.remove( outlineLine );
  outlineLine = line.clone();
  outline.add( outlineLine );
  if( outlineOnly ){
    return;
  }

  const pointsGeometry = new THREE.Geometry();
  pointsGeometry.vertices.push( ...positions );
  points = new THREE.Points( pointsGeometry, pointsMaterial );
  group.add( points );

  const groundVerts = [];
  positions.forEach( function( p ){
    const pg = new THREE.Vector3( p.x, 0, p.z );
    const pv = new THREE.Vector3( p.x, p.y, p.z );
    groundVerts.push( pv, pg );
  });
  const groundLineGeometry = new THREE.Geometry();
  groundLineGeometry.vertices.push( ... groundVerts );
  groundLine = new THREE.LineSegments( groundLineGeometry, groundLineMaterial );
  group.add( groundLine );

  if( positions.length >= 3 ){

    const shape = new THREE.Shape();
    positions.forEach( function(p,index){
      if( index === 0 ){
        shape.moveTo( p.x, p.z );
      }
      else{
        shape.lineTo( p.x, p.z )
      }
    });

    const extrudeGeometry = new THREE.ExtrudeGeometry( shape, {
      steps: 1,
      amount: extrudeHeight,
      bevelEnabled: false
    });



    extrudeMesh = new THREE.Mesh( extrudeGeometry, extrudeMaterial );
    extrudeMesh.rotation.x = Math.PI * 0.5;
    extrudeMesh.position.y = extrudeHeight;

    group.add( extrudeMesh );

  }
}

function save(){
  localStorage.plane = JSON.stringify( positions );
}

function load(){
  if( localStorage.plane === undefined ){
    return;
  }

  positions.length = 0;
  positions.push( ...JSON.parse( localStorage.plane ) );
}

load();
draw( true );

export default {
  group, mark, reset, clear, draw, save, load, outline
};