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

// Vertex Shader
const vertexShader = `
  uniform float u_time;
  uniform float u_radius;
  uniform float u_tube;
  uniform float u_flowSpeed;
  const float PI = 3.141592653589793238;

  void main(){
    float u = uv.x * 2.0 * PI;
    float v = uv.y * 2.0 * PI;

    v += u_time * u_flowSpeed;

    float x = (u_radius + u_tube * cos(v)) * cos(u);
    float y = (u_radius + u_tube * cos(v)) * sin(u);
    float z = u_tube * sin(v);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
  }`;

// Fragment Shader
const fragmentShader = `
  void main(){
    gl_FragColor = vec4(0.0, 1.0, 0.4, 1.0);
}`;

const uniforms = {
  u_time: { value: 0 },
  u_radius: { value: settings.radius },
  u_tube: { value: settings.tube },
  u_flowSpeed: { value: 0.5 }
};


gui.add(settings, 'rotationSpeed', 0, 0.1);
gui.add(settings, 'radius', 0.1, 5). onChange(() => {
  updateTorus();
  uniforms.u_radius.value = settings.radius;
});
gui.add(settings, 'tube', 0.1, 5).onChange(() => {
  updateTorus();
  uniforms.u_tube.value = settings.tube;
});
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

const torusGeometry = new THREE.TorusGeometry( 1, 1, 40, 40 );
const torusMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
  wireframe: true
});

function makeTorusInstance(y) {
  const torus = new THREE.Mesh(torusGeometry, torusMaterial);
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

const torus = makeTorusInstance(0);

scene.add( torus );
camera.position.y = 5;

function animate() {

  settings.rotateX && (torus.rotation.x += settings.rotationSpeed);
  settings.rotateY && (torus.rotation.y += settings.rotationSpeed);
  settings.rotateZ && (torus.rotation.z += settings.rotationSpeed);
  settings.flowAnimation && (uniforms.u_time.value += settings.rotationSpeed);

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  controls.update();
}

requestAnimationFrame( animate );
