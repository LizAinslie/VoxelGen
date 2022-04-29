import {
  AmbientLight, BoxGeometry, HemisphereLight, Mesh, MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { BLOCK_SIZE, World, WORLD_SIZE, Y_MAX } from "./world";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {SSAOPass} from "three/examples/jsm/postprocessing/SSAOPass";

export default class App {
  constructor(container) {
    this.container = container;
    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setClearColor(new Color('skyblue'))
    this.container.appendChild(this.renderer.domElement);

    this.width = this.renderer.domElement.width;
    this.height = this.renderer.domElement.height;

    this.camera = new PerspectiveCamera(75, this.width / this.height, 1, 2000);
    this.camera.position.y = (Y_MAX * BLOCK_SIZE) * 2
    this.camera.updateProjectionMatrix();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
    this.controls.target.set(WORLD_SIZE * 0.5 * BLOCK_SIZE, 0, WORLD_SIZE * 0.5 * BLOCK_SIZE)
    this.controls.update();

    this.scene = new Scene();

    // this.composer = new EffectComposer(this.renderer);
    // const ssaoPass = new SSAOPass(this.scene, this.camera, this.width, this.height);
    // ssaoPass.kernelRadius = 4;
    // this.composer.addPass(ssaoPass);

    this.world = new World(this.scene);
    this.world.preGenerate();

    const ambientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);

    window.onresize = () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      // this.composer.setSize(this.width, this.height);
    }

    if (typeof window.__THREE_DEVTOOLS__ !== 'undefined') {
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.scene }));
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: this.renderer }));
    }
  }
    
  render() {
    requestAnimationFrame(this.render.bind(this));

    this.controls.update();

    const loadingDiv = document.getElementById('loading');
    if (loadingDiv.style.display !== 'none') loadingDiv.style.display = 'none'

    this.renderer.render(this.scene, this.camera);
    // this.composer.render();
  }
}
