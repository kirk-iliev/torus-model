import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
const gui = new dat.GUI();

const settings = {
  rotationSpeed: 1,
  radius: 1,
  tube: 1,
  rotateX: false,
  rotateY: false,
  rotateZ: false,
  flowAnimation: false,
  radialSegments: 40,
  tubularSegments: 40
};

const uniforms = {
  u_time: { value: 0 },
  u_radius: { value: settings.radius },
  u_tube: { value: settings.tube },
  u_flowSpeed: { value: 1 }
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

    v += u_time * u_flowSpeed * 0.01;

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

const reset = {
  resetTorus: () => {
    settings.rotationSpeed = 1;
    settings.radius = 1;
    settings.tube = 1;
    settings.radialSegments = 40;
    settings.tubularSegments = 40;
    settings.rotateX = false;
    settings.rotateY = false;
    settings.rotateZ = false;
    settings.flowAnimation = false;

    uniforms.u_radius.value = settings.radius;
    uniforms.u_tube.value = settings.tube;

    Torus.resetTransform();
    camera.position.set(0, 4, 0);
    controls.update();

    Object.values(controllers).forEach((controller) => {
      controller.updateDisplay();
    });
    Torus.update();;
  }
}

const controllers = {
  rotationSpeed: gui.add(settings, 'rotationSpeed', 0.1, 5, 0.01),
  radius: gui.add(settings, 'radius', 0.1, 5, 0.005).onChange(() => {
    Torus.update();
    uniforms.u_radius.value = settings.radius;
  }),
  tube: gui.add(settings, 'tube', 0.1, 5, 0.005).onChange(() => {
    Torus.update();
    uniforms.u_tube.value = settings.tube;
  }),
  radialSegments: gui.add(settings, 'radialSegments', 3, 100).onChange(() => {
    Torus.update();
  }),
  tubularSegments: gui.add(settings, 'tubularSegments', 3, 100).onChange(() => {
    Torus.update();
  }),
  rotateX: gui.add(settings, 'rotateX'),
  rotateY: gui.add(settings, 'rotateY'),
  rotateZ: gui.add(settings, 'rotateZ'),
  flowAnimation: gui.add(settings, 'flowAnimation'),
}

gui.add(reset, 'resetTorus').name('Click here to reset Torus')

Object.values(controllers).forEach(controller => controller.updateDisplay());

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  90, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const Torus = {
  mesh: null,

  create() {
    const geometry = new THREE.TorusGeometry(
      settings.radius,
      settings.tube,
      settings.radialSegments,
      settings.tubularSegments
    );

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      wireframe: true
    });

    this.mesh = new THREE.Mesh(geometry, material);
    scene.add(this.mesh);
  },

  update() {
    const newGeometry = new THREE.TorusGeometry(
      settings.radius,
      settings.tube,
      settings.radialSegments,
      settings.tubularSegments
    );

    this.mesh.geometry.dispose();
    this.mesh.geometry = newGeometry;
  },

  resetTransform() {
    this.mesh.position.set( 0, 0, 0)
    this.mesh.rotation.set( 0, 0, 0);
  }
};

Torus.create();
camera.position.y = 4;

function animate() {

  settings.rotateX && (Torus.mesh.rotation.x += settings.rotationSpeed * 0.01);
  settings.rotateY && (Torus.mesh.rotation.y += settings.rotationSpeed * 0.01);
  settings.rotateZ && (Torus.mesh.rotation.z += settings.rotationSpeed * 0.01);
  settings.flowAnimation && (uniforms.u_time.value += settings.rotationSpeed);

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
  controls.update();
}

requestAnimationFrame( animate );
