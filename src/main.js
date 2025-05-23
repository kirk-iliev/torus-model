import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const TorusGeometry = new THREE.TorusGeometry( 0.5, 0.5, 25, 25 );

function makeTorusInstance(geometry, color, y) {
  const material = new THREE.MeshBasicMaterial( { color, wireframe: true } );
  const torus = new THREE.Mesh(geometry, material);
  torus.position.y = y;
  return torus;
}
const blueTorus =  makeTorusInstance(TorusGeometry, 0x0000ff, 3);
const redTorus = makeTorusInstance(TorusGeometry, 0xff0000, 0);
const greenTorus = makeTorusInstance(TorusGeometry, 0x00ff00, -3);

scene.add( blueTorus, redTorus, greenTorus );
camera.position.z = 5;

function animate() {
  blueTorus.rotation.y += 0.01;
  redTorus.rotation.x += 0.01;
  greenTorus.rotation.z += 0.01;
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  controls.update();
}

requestAnimationFrame( animate );
