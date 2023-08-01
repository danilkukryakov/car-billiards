import {
	Angle, CannonJSPlugin, CubeTexture,
	Engine, GroundMesh, Mesh, MeshBuilder,
	PBRMaterial, PhysicsImpostor, Scene, SceneLoader, Texture, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import * as CANNON from 'cannon';

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

	private carCollider?: Mesh;

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
		this.createScenePhysics();
		this.groundMesh = this.createGround();
		this.createCar();
		this.initializeSceneActions();
		this.createImpostors();
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
		ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);

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
		const carMesh = meshes[0];
		carMesh.rotation = new Vector3(0, Angle.FromDegrees(90).radians(), 0);

		this.carCollider = MeshBuilder.CreateBox('carCollider', {
			width: 3.5,
			height: 1,
			depth: 1.5,
		});
		this.carCollider.position.y = 0.5;
		this.carCollider.visibility = 0.5;

		this.carCollider.physicsImpostor = new PhysicsImpostor(this.carCollider, PhysicsImpostor.BoxImpostor, {
			mass: 10,
			restitution: 0,
			friction: 0,
		}, this.scene);

		this.carCollider.physicsImpostor.physicsBody.linearDamping = 0.5;

		carMesh.setParent(this.carCollider);
	}

	private initializeSceneActions(): void {
		this.scene.onPointerPick = (_event, pickerInfo) => {
			if (this.carCollider && this.groundMesh === pickerInfo.pickedMesh && pickerInfo.pickedPoint) {
				const vector = pickerInfo.pickedPoint.subtract(this.carCollider?.position ?? Vector3.Zero());
				this.carCollider?.physicsImpostor?.setLinearVelocity(vector);

				const angleRadians = -Math.atan2(
					this.carCollider.position.z - pickerInfo.pickedPoint.z,
					this.carCollider.position.x - pickerInfo.pickedPoint.x,
				);

				this.carCollider.rotation = new Vector3(0, angleRadians, 0);
			}
		};

	}

	private createScenePhysics(): void {
		const gravityVector = new Vector3(0, -9.81, 0);
		this.scene.enablePhysics(gravityVector, new CannonJSPlugin(true, 19, CANNON));
	}

	private createImpostors(): void {
		const box = MeshBuilder.CreateBox('box', { size: 5 });
		box.position = new Vector3(5, 10, 5);

		box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {
			mass: 5,
			restitution: 0.5,
		}, this.scene);
	}
}
