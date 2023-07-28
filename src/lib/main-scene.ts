import {
	AbstractMesh, CubeTexture,
	Engine, GroundMesh, MeshBuilder,
	PBRMaterial, Scene, SceneLoader, Texture,
} from '@babylonjs/core';
import '@babylonjs/loaders';

import { aoTexturePath, diffuseTexturePath, normalTexturePath, roughnessTexturePath } from 'assets/textures/ground';
import { environmentTexturePath } from 'assets/environment';
import { carModelPath } from 'assets/models';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';

/** Main scene of the app. */
export class MainScene {

	private readonly engine: Engine;

	private readonly scene: Scene;

	private groundMesh?: GroundMesh;

	private carMesh?: AbstractMesh;

	public constructor(canvas: HTMLCanvasElement) {
		this.engine = new Engine(canvas);
		this.scene = new Scene(this.engine);
	}

	/** Render the scene. */
	public render(): void {
		this.initializeScene();
		this.engine.runRenderLoop(() => this.scene.render());
	}

	/** Erase 3D related resources. */
	public erase(): void {
		this.scene.dispose();
		this.engine.dispose();
	}

	private initializeScene(): void {
		MainCamera.create(this.scene);
		MainLight.create(this.scene);
		this.createSkybox();
		this.groundMesh = this.createGround();
		this.createCar();
		this.initializeSceneActions();
	}

	private createSkybox(): void {
		const environmentTexture = CubeTexture.CreateFromPrefilteredData(
			environmentTexturePath,
			this.scene,
		);
		this.scene.environmentTexture = environmentTexture;
		this.scene.createDefaultSkybox(environmentTexture, true, 1000, 0.1);
	}

	private createGround(): GroundMesh {
		const ground = MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, this.scene);
		const material = this.createGroundMaterial();
		ground.material = material;
		return ground;
	}

	private createGroundMaterial(): PBRMaterial {
		const material = new PBRMaterial('pbrGroundMaterial', this.scene);
		const uvScale = 4;
		const textures: Texture[] = [];

		const diffuseTexture = new Texture(
			diffuseTexturePath,
			this.scene,
		);
		textures.push(diffuseTexture);
		material.albedoTexture = diffuseTexture;

		const aoTexture = new Texture(
			aoTexturePath,
			this.scene,
		);
		textures.push(aoTexture);
		material.ambientTexture = aoTexture;

		const normalTexture = new Texture(
			normalTexturePath,
			this.scene,
		);
		textures.push(normalTexture);
		material.bumpTexture = normalTexture;

		const metallicTexture = new Texture(
			roughnessTexturePath,
			this.scene,
		);
		textures.push(metallicTexture);
		material.metallicTexture = metallicTexture;
		material.useRoughnessFromMetallicTextureAlpha = true;

		textures.forEach(texture => {
			texture.uScale = uvScale;
			texture.vScale = uvScale;
		});

		return material;
	}

	private async createCar(): Promise<void> {
		const { meshes } = await SceneLoader.ImportMeshAsync('', carModelPath, '', this.scene);
		this.carMesh = meshes[0];
	}

	private initializeSceneActions(): void {
		this.scene.onPointerPick = (_event, pickerInfo) => {
			if (this.carMesh && this.groundMesh === pickerInfo.pickedMesh && pickerInfo.pickedPoint) {
				this.carMesh.position = pickerInfo.pickedPoint;
			}
		};
	}
}
