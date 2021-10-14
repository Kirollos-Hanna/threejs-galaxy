import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import testVertexShader from "./shaders/test/vertex.glsl";
import testFragmentShader from "./shaders/test/fragment.glsl";

/**
 * Base
 */

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 0.5;
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3);
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);

// Hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
scene.add(hemisphereLight);

// Point light
const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 2);
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

// Rect area light
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
rectAreaLight.lookAt(new THREE.Vector3());
scene.add(rectAreaLight);

// Spot light
const spotLight = new THREE.SpotLight(
  0x78ff00,
  0.5,
  10,
  Math.PI * 0.1,
  0.25,
  1
);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);

spotLight.target.position.x = -0.75;
scene.add(spotLight.target);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 1;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Test mesh
 */
// // Geometry
// const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)

// const count = geometry.attributes.position.count
// const randoms = new Float32Array(count)

// for(let i = 0; i < count; i++)
// {
//     randoms[i] = Math.random()
// }

// geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

// // Material
// const material = new THREE.ShaderMaterial({
//     vertexShader: testVertexShader,
//     fragmentShader: testFragmentShader,
//     uniforms:
//     {
//         uFrequency: { value: new THREE.Vector2(10, 5) },
//         uTime: { value: 0 },
//         uColor: { value: new THREE.Color('orange') },
//         uResolution: {value: new THREE.Vector2(1,2)}
//     }
// })

// gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX')
// gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY')

// // Mesh
// const mesh = new THREE.Mesh(geometry, material)
// mesh.scale.y = 2 / 3
// scene.add(mesh)

// const curve = new THREE.EllipseCurve(
// 	0,  0,            // ax, aY
// 	10, 5,            // xRadius, yRadius
// 	0,  2 * Math.PI,  // aStartAngle, aEndAngle
// 	false,            // aClockwise
// 	0                 // aRotation
// );

// const points = curve.getPoints( 50 );
// const geometry = new THREE.BufferGeometry().setFromPoints( points );

// const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

// // Create the final object to add to the scene
// const ellipse = new THREE.Line( geometry, material );
// scene.add(ellipse)
const shape = new THREE.Shape();
const x = -5;
const y = -10;
shape.moveTo(x + 2.5, y + 2.5);
shape.ellipse(x, y, 10, 5, 0, Math.PI * 2);
// shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2.5, y + 2.5, x, y);
// shape.bezierCurveTo(x + 2.5, y + 2.5, x - 2.5, y - 2.5, x - 2.5, y - 2.5);
// shape.bezierCurveTo(x - 5, y - 5, x - 5, y - 5, x - 5, y - 5);
// shape.bezierCurveTo(x + 5, y + 5, x + 5, y + 5, x, y);
// shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
// shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
// shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
// shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
// shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

const extrudeSettings = {
  steps: 2,

  depth: 2,

  bevelEnabled: true,
  bevelThickness: 1,

  bevelSize: 1,

  bevelSegments: 2,
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;
const mesh = new THREE.Mesh(geometry, material);
mesh.position.x = -6.2;
mesh.position.y = -2;
mesh.position.z = -8.5;
mesh.rotation.y = 1;
scene.add(mesh);

gui.add(mesh.rotation, "x").min(-20).max(20).step(0.1).name("frequencyX");
gui.add(mesh.rotation, "y").min(-20).max(20).step(0.1).name("frequencyY");
gui.add(mesh.rotation, "z").min(-20).max(20).step(0.1).name("frequencyZ");

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
