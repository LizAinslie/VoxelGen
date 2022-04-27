import {
  AmbientLight, BoxBufferGeometry,
  BoxGeometry, BufferAttribute, Color, Fog,
  Mesh,
  MeshBasicMaterial, MeshLambertMaterial,
  PerspectiveCamera, PointLight,
  Scene, TorusKnotGeometry, VertexColors,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import SimplexNoise from "./simplex";

const BLOCK_WIDTH = 5
const SIZE_MAX = 128;
const Y_MAX = 32;
const HUE_MAX = 360
const Y_COLOR_MULT = HUE_MAX / Y_MAX;

const simplex = new SimplexNoise();

function normalizeNoise(noise) {
  return (noise + 1) * 0.5
}

class Block {
  constructor(x, y, z, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;

    this.geometry = new BoxGeometry(BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);
    this.material = new MeshLambertMaterial({
      color: this.color
    });

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x * BLOCK_WIDTH, this.y * BLOCK_WIDTH, this.z * BLOCK_WIDTH);
  }

  getMesh() {
    return this.mesh;
  }
}

export default class App {
  constructor(container) {
    this.container = container;
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new Color('skyblue'))
    this.container.appendChild(this.renderer.domElement);

    this.scene = new Scene();

    const cubeGeometries = []

    for (let x = 0; x < SIZE_MAX; x++) {
      for (let z = 0; z < SIZE_MAX; z++) {
        const noiseX = x / 50;
        const noiseZ = z / 50;

        let y = normalizeNoise(simplex.noise(simplex.noise(noiseX, -noiseZ) + noiseX, simplex.noise(noiseZ, -noiseX) + noiseZ));
        y *= Y_MAX;
        y = Math.round(y);
        // console.log("xyz", x, y, z);

        let h = y;
        while (h-- >= -1) {
          if (h < -1) break;
          const geometry = new BoxBufferGeometry(BLOCK_WIDTH, BLOCK_WIDTH, BLOCK_WIDTH);
          geometry.translate(x * BLOCK_WIDTH, h * BLOCK_WIDTH, z * BLOCK_WIDTH);

          let hue = h * Y_COLOR_MULT;
          if (h === -1) hue = 0;
          const color = new Color(`hsl(${hue}, 70%, 60%)`);
          const rgb = color.toArray().map(v => v * 255);

          // make an array to store colors for each vertex
          const numVerts = geometry.getAttribute('position').count;
          const itemSize = 3;  // r, g, b
          const colors = new Uint8Array(itemSize * numVerts);

          // copy the color into the colors array for each vertex
          colors.forEach((v, ndx) => {
            colors[ndx] = rgb[ndx % 3];
          });

          const normalized = true;
          const colorAttrib = new BufferAttribute(colors, itemSize, normalized);
          geometry.addAttribute('color', colorAttrib);

          cubeGeometries.push(geometry);
        }
      }
    }

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      cubeGeometries, false);
    const material = new MeshLambertMaterial({
      vertexColors: VertexColors,
    });
    const mesh = new Mesh(mergedGeometry, material);
    this.scene.add(mesh);

    const ambientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);

    this.width = this.renderer.domElement.width;
    this.height = this.renderer.domElement.height;

    this.camera = new PerspectiveCamera(40, this.width / this.height);
    this.camera.position.y = (Y_MAX * BLOCK_WIDTH) * 2
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.target.set(SIZE_MAX * 0.5 * BLOCK_WIDTH, 0, SIZE_MAX * 0.5 * BLOCK_WIDTH)
    this.controls.update();

    window.onresize = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
    
  render() {
    requestAnimationFrame(this.render.bind(this));

    this.controls.update();

    const loadingDiv = document.getElementById('loading');
    if (loadingDiv.style.display !== 'none') loadingDiv.style.display = 'none'

    this.renderer.render(this.scene, this.camera);
  }
}
