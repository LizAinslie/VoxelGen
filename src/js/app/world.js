import {BoxBufferGeometry, BufferAttribute, Color, Mesh, MeshLambertMaterial, VertexColors} from "three";
import {normalizeNoise, simplex} from "./util";
import {BufferGeometryUtils} from "three/examples/jsm/utils/BufferGeometryUtils";

export const BLOCK_SIZE = 5;
export const CHUNK_SIZE = 16;
export const Y_MAX = 32;
export const WORLD_SIZE = 384;
export const HUE_MAX = 360;
export const Y_COLOR_MULT = HUE_MAX / Y_MAX

export class Block {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  getGeometry() {
    const geometry = new BoxBufferGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    geometry.translate(this.x * BLOCK_SIZE, this.y * BLOCK_SIZE, this.z * BLOCK_SIZE);

    const hue = Math.max(Math.floor(this.y * Y_COLOR_MULT), 0);
    const color = new Color(`hsl(${hue}, 70%, 60%)`);
    const rgb = color.toArray().map(v => v * 255);
    // make an array to store colors for each vertex
    const numVertices = geometry.getAttribute('position').count;
    const itemSize = 3;
    const colors = new Uint8Array(itemSize * numVertices);

    // copy the color into the colors array for each vertex
    colors.forEach((v, ndx) => {
      colors[ndx] = rgb[ndx % 3];
    });

    const normalized = true;
    const colorAttrib = new BufferAttribute(colors, itemSize, normalized);
    geometry.setAttribute('color', colorAttrib);

    return geometry;
  }
}

export class Chunk {
  constructor(chunkX, chunkZ, noiseY) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;

    this.blocks = [];
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const noiseX = (x + (this.chunkX * CHUNK_SIZE)) / 200;
        const noiseZ = (z + (this.chunkZ * CHUNK_SIZE)) / 200;

        let y = normalizeNoise(simplex.noise3D(simplex.noise3D(noiseX, noiseY, -noiseZ) + noiseX, noiseY, simplex.noise3D(noiseZ, noiseY, -noiseX) + noiseZ));
        y = Math.round(y * Y_MAX);

        while (y-- >= -1) {
          if (y < -1) break;

          const block = new Block(x, y, z);
          this.blocks.push(block);
        }
      }
    }
  }
  
  getMesh() {
    const cubeGeometries = [];
    this.blocks.forEach(block => {
      cubeGeometries.push(block.getGeometry());
    });

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      cubeGeometries, false);
    const material = new MeshLambertMaterial({
      vertexColors: VertexColors,
    });
    const mesh = new Mesh(mergedGeometry, material);

    const chunkRealX = this.chunkX * CHUNK_SIZE * BLOCK_SIZE;
    const chunkRealY = 0;
    const chunkRealZ = this.chunkZ * CHUNK_SIZE * BLOCK_SIZE

    mesh.position.set(chunkRealX, chunkRealY, chunkRealZ);
    return mesh;
  }
}

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
  }

  get cubes() {
    return WORLD_SIZE * WORLD_SIZE * Y_MAX;
  }

  preGenerate(radius = WORLD_SIZE) {
    console.log(`Generating ${this.cubes} cubes`);
    const noiseY = Date.now() / 100000;
    radius = Math.round(radius / CHUNK_SIZE)
    for (let chunkX = 0; chunkX < radius; chunkX++)
      for (let chunkZ = 0; chunkZ < radius; chunkZ++)
        this.generateChunkAtChunkPos(chunkX, chunkZ, noiseY);
  }

  generateChunkAtChunkPos(chunkX, chunkZ, noiseY) {
    // console.log(`generating chunk mesh at ${chunkX}, ${chunkZ} (x,z)`)
    const chunk = new Chunk(chunkX, chunkZ, noiseY);
    this.chunks.push(chunk);
    const mesh = chunk.getMesh();
    this.scene.add(mesh);
  }

  generateChunkAtBlockPos(blockX, blockZ, noiseY) {
    const chunkX = Math.round(blockX / CHUNK_SIZE);
    const chunkZ = Math.round(blockZ / CHUNK_SIZE);
    this.generateChunkAtChunkPos(chunkX, chunkZ, noiseY);
  }
}
