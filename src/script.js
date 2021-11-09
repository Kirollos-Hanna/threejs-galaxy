import "./style.css";
import * as THREE from "three";
// import Stats from 'stats.js'
// import * as dat from "dat.gui";
import galaxyVertexShader from "./shaders/galaxy/vertex.glsl";
import galaxyFragmentShader from "./shaders/galaxy/fragment.glsl";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

// Stats
// const stats = new Stats()
// stats.showPanel(0)
// document.body.appendChild(stats.dom)

/**
 * Base
 */

// Debug
// const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Overlay
const overlayGeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: {value: 0.9}
  },
  vertexShader: `
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uAlpha;
    
    void main(){
      gl_FragColor = vec4(1.0, 1.0, 1.0, uAlpha);
    }
  `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Lights
 */

// Directional light
const directionalLightParams = {
  intensity: 12,
  x: 0,
  y: -1.5,
  z: -7,
  color: "#f03902"
}
let directionalLight = null
const createDirectionalLight = () => {
  if(directionalLight !== null){
    directionalLight.dispose()
    scene.remove(directionalLight)
  }
  directionalLight = new THREE.DirectionalLight(directionalLightParams.color, directionalLightParams.intensity);
  directionalLight.position.set(directionalLightParams.x, directionalLightParams.y, directionalLightParams.z);
  scene.add(directionalLight);
}
createDirectionalLight()
// gui.add(directionalLightParams, 'x').min(-20).max(20).step(0.001).onFinishChange(createDirectionalLight)

// Hemisphere light
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
scene.add(hemisphereLight);

// Point light
const pointLight = new THREE.PointLight(0xffffff, 8, 10, 2);
pointLight.position.set(0, 0, 1);
scene.add(pointLight);

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
const cameraParams = {
  fov: 75,
  near: 0.1,
  far: 100
}
let camera = null
const createCamera = () => {
  if(camera !== null){
    scene.remove(camera)
  }
  camera = new THREE.PerspectiveCamera(
    cameraParams.fov,
    sizes.width / sizes.height,
    cameraParams.near,
    cameraParams.far
  );
  camera.position.x = 0;
  camera.position.y = 1;
  camera.position.z = 1;
  scene.add(camera);
}
createCamera()

const changeCameraPos = (value, pos) => {
  camera.position[pos] = value;
}

// gui.add(camera.rotation, 'x').min(-20).max(20).step(0.001).onFinishChange((value) => changeCameraPos(value,'x'))


/**
 * Renderer
 */
 const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Models

// Loader
const loadingBar = document.querySelector(".loading-bar");

const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 0.1, value: 0 })
      
      gsap.to(camera.position, { duration: 5, y: 6.25, z: 5 })
      gsap.to(camera.rotation, { duration: 5, x: -1 })
      
      loadingBar.style.display = 'none'
      setTimeout(() => {
        overlayGeometry.dispose()
        overlayMaterial.dispose()
        scene.remove(overlay)
      }, 100)
    })
  },
  // Progress
  (assetUrl, assetsLoaded, assetTotal) => {
    const progressRatio = assetsLoaded / assetTotal;
    loadingBar.style.transform = `scale(${progressRatio}, ${progressRatio})`
  }
)
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.load(
  './textures/galaxyManModel.gltf',
  (gltf) => {
    gltf.scene.scale.set(0.4, 0.4, 0.4)
    gltf.scene.position.y += 2
    gltf.scene.position.z += -1
    gltf.scene.rotation.x += -0.5
    scene.add(gltf.scene)
  }
)
// Galaxy
const parameters = {
  count: 50000,
  size: 0.01,
  radius: 7,
  branches: 10,
  spin: 1,
  randomness: 2,
  randomnessPower: 7,
  insideColor: '#f03902',
  outsideColor: '#0244e8'
}
let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
  if(points !== null){
    geometry.dispose()
    material.dispose()
    scene.remove(points)
  }
  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count*3)
  const colors = new Float32Array(parameters.count*3)
  const scales = new Float32Array(parameters.count*1)
  const randomness = new Float32Array(parameters.count*3)

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  for(let i = 0; i < parameters.count; i++){
    const i3 = i * 3

    // Position
    const RandomNum = Math.random();
    if(RandomNum > 0.3){
      const radius = RandomNum * parameters.radius
      const spinAngle = radius * parameters.spin
      const branchAngle = (i % parameters.branches) / parameters.branches * 2 * Math.PI

      // Randomness
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

      positions[i3+0] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3+1] = randomY
      positions[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

      randomness[i3 + 0] = randomX
      randomness[i3 + 1] = randomY
      randomness[i3 + 2] = randomZ
    
      // Color
      const mixedColor = colorInside.clone()
      mixedColor.lerp(colorOutside, radius / (parameters.radius + 1))

      colors[i3+0] = mixedColor.r
      colors[i3+1] = mixedColor.g
      colors[i3+2] = mixedColor.b

      // Scales
      scales[i] = Math.random()
    }
  }
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  )

  geometry.setAttribute(
    'aScale',
    new THREE.BufferAttribute(scales, 1)
  )

  geometry.setAttribute(
    'aRandomness',
    new THREE.BufferAttribute(randomness, 3)
  )
  // Material
  material = new THREE.ShaderMaterial({
    // depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 120 * renderer.getPixelRatio() }
    },
    vertexShader: galaxyVertexShader,
    fragmentShader: galaxyFragmentShader
  })

  // Points
  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()


// gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)

/**
 * Animate
 */
const clock = new THREE.Clock();
let lastElapsedTime = 0;

const tick = () => {
  // stats.begin()
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - lastElapsedTime;
  lastElapsedTime = elapsedTime;
  points.rotation.y += deltaTime * 0.1;

  // Update material
  material.uniforms.uTime.value = elapsedTime;

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
  // stats.end()
};

tick();






/**
 * Test mesh
 */
// TODO
// const shape = new THREE.Shape();
// let x = 0;
// let y = 0;
// shape.ellipse(x, y, 5, 4, 0, Math.PI * 2);

// const extrudeSettings = {
//   steps: 2,

//   depth: 0.1,

//   bevelEnabled: true,
//   bevelThickness: 0.5,

//   bevelSize: 1,

//   bevelSegments: 2,
// };

// const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

// const material = new THREE.MeshStandardMaterial();
// material.roughness = 0.4;
// material.transparent = true;
// material.opacity = 0.15;
// material.color = new THREE.Color(0x0000ff);

// const mesh = new THREE.Mesh(geometry, material);
// mesh.position.x = -1.25;
// mesh.position.y = -1;
// mesh.position.z = -20;
// mesh.rotation.x = 1.75;
// mesh.rotation.y = 0;
// mesh.rotation.z = 0.05;

// const shape2 = new THREE.Shape();
// shape2.ellipse(0, 0, 10, 5, 0, Math.PI * 2);

// const extrudeSettings2 = {
//   steps: 2,

//   depth: 0.1,

//   bevelEnabled: true,
//   bevelThickness: 0.5,

//   bevelSize: 1,

//   bevelSegments: 2,
// };

// const geometry2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings2);
// const material2 = new THREE.MeshStandardMaterial();
// material2.roughness = 0.4;
// material2.transparent = true;
// material2.opacity = 0.15;
// material2.color = new THREE.Color(0xff0000);

// const mesh2 = new THREE.Mesh(geometry2, material2);
// mesh2.position.x = -1.25;
// mesh2.position.y = -0.9;
// mesh2.position.z = -20;
// mesh2.rotation.x = 1.75;
// mesh2.rotation.y = 0;
// mesh2.rotation.z = 0.05;

// scene.add(mesh);
// scene.add(mesh2);

// gui.add(mesh.position, "x").min(-20).max(20).step(0.01).name("posX");
// gui.add(mesh.position, "y").min(-20).max(20).step(0.01).name("posY");
// gui.add(mesh.position, "z").min(-20).max(20).step(0.01).name("posZ");
// gui.add(mesh.rotation, "x").min(-20).max(20).step(0.01).name("rotX");
// gui.add(mesh.rotation, "y").min(-20).max(20).step(0.01).name("rotY");
// gui.add(mesh.rotation, "z").min(-20).max(20).step(0.01).name("rotZ");
