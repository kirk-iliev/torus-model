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
  flowAnimation: false,
  rainbowMode: false
};

// Vertex Shader
const vertexShader = `
  uniform float u_time;
  uniform float u_radius;
  uniform float u_tube;
  uniform float u_flowSpeed;
  const float PI = 3.141592653589793238;
  varying float v_v;

  void main(){
    float u = uv.x * 2.0 * PI;
    float v = uv.y * 2.0 * PI;

    v += u_time * u_flowSpeed;
    v_v = v;

    float x = (u_radius + u_tube * cos(v)) * cos(u);
    float y = (u_radius + u_tube * cos(v)) * sin(u);
    float z = u_tube * sin(v);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(x, y, z, 1.0);
  }`;

// Fragment Shader
const fragmentShader = `
uniform float u_time;
uniform float u_rainbowMode;
varying float v_v;

const float PI = 3.141592653589793238;

vec3 getColor(int index) {
  if (index == 0) return vec3(1.0, 0.0, 0.0);      // Red
  if (index == 1) return vec3(1.0, 0.5, 0.0);      // Orange
  if (index == 2) return vec3(1.0, 1.0, 0.0);      // Yellow
  if (index == 3) return vec3(0.0, 1.0, 0.0);      // Green
  if (index == 4) return vec3(0.0, 0.0, 1.0);      // Blue
  return vec3(0.5, 0.0, 1.0);                      // Purple
}

void main() {
  if (u_rainbowMode < 0.5) {
    gl_FragColor = vec4(0.0, 1.0, 0.4, 1.0); // basic green
    return;
  }

  float phase = mod(v_v / (2.0 * PI) - u_time * 0.1, 1.0);
  float segments = 6.0;
  float width = 1.0 / segments;
  float softness = 0.05;

  vec3 finalColor = vec3(0.0);
  float totalWeight = 0.0;

  for (int i = 0; i < 6; i++) {
    float center = (float(i) + 0.5) / segments;
    float dist = abs(phase - center);
    dist = min(dist, 1.0 - dist);

    float weight = smoothstep(width * 0.5, width * 0.5 - softness, dist);
    vec3 color = getColor(i);

    finalColor += color * weight;
    totalWeight += weight;
  }

  finalColor = finalColor / totalWeight;
  gl_FragColor = vec4(finalColor, 1.0);
}`;

const uniforms = {
  u_time: { value: 0 },
  u_radius: { value: settings.radius },
  u_tube: { value: settings.tube },
  u_flowSpeed: { value: 0.5 },
  u_rainbowMode: { value: settings.rainbowMode ? 1.0 : 0.0 }
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
gui.add(settings, 'rainbowMode');

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
  uniforms.u_rainbowMode.value = settings.rainbowMode ? 1.0 : 0.0;

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  controls.update();
}

requestAnimationFrame( animate );
