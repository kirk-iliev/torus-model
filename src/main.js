import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const gui = new dat.GUI();
const settings = {
  rotationSpeed: 0.01,
  radius: 1,
  tube: 1,
  rotateX: false,
  rotateY: false,
  rotateZ: false,
  flowAnimation: false
};

gui.add(settings, 'rotationSpeed', 0, 0.1);
gui.add(settings, 'radius', 0.1, 5). onChange(() => { updateTorus();});
gui.add(settings, 'tube', 0.1, 5).onChange(() => { updateTorus();});
gui.add(settings, 'rotateX');
gui.add(settings, 'rotateY');
gui.add(settings, 'rotateZ');
gui.add(settings, 'flowAnimation');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const TorusGeometry = new THREE.TorusGeometry( 1, 1, 40, 40 );

function makeTorusInstance(geometry, color, y) {
  const material = new THREE.MeshBasicMaterial( { color, wireframe: true } );
  const torus = new THREE.Mesh(geometry, material);
  torus.position.y = y;
  return torus;
}

function updateTorus() {
  scene.remove(torus);
  torus.geometry.dispose();
  const newGeometry = new THREE.TorusGeometry(settings.radius, settings.tube, 40, 40);
  torus.geometry = newGeometry;
  scene.add(torus);
}

const torus = makeTorusInstance(TorusGeometry, 0x00ff00, 0);

scene.add( torus );
camera.position.y = 5;

function animate() {

  settings.rotateX && (torus.rotation.x += settings.rotationSpeed);
  settings.rotateY && (torus.rotation.y += settings.rotationSpeed);
  settings.rotateZ && (torus.rotation.z += settings.rotationSpeed);

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  controls.update();
}

requestAnimationFrame( animate );
