import {
	AbstractMesh, Angle, CannonJSPlugin, CubeTexture,
	Engine, GroundMesh, Mesh, MeshBuilder, PBRMaterial,
	PhysicsImpostor, PointerEventTypes, Scene, SceneLoader, Texture, Vector3,
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

	private carGround?: GroundMesh;

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
		this.createGround();
		this.createCarGround();
		this.createCar();
		this.initializeSceneActions();
		this.createBoxImpostor();
		this.createSphereImpostor();
	}

	private createSkybox(): void {
		const environmentTexture = CubeTexture.CreateFromPrefilteredData(
			environmentTexturePath,
			this.scene,
		);
		this.scene.environmentTexture = environmentTexture;
		this.scene.createDefaultSkybox(environmentTexture, true, 1000, 0.1);
	}

	private createGround(): void {
		const ground = MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, this.scene);
		const material = this.createGroundMaterial();
		ground.material = material;
		ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);
		ground.isPickable = false;
	}

	private createCarGround(): void {
		const carGround = MeshBuilder.CreateGround('carGround', { width: 1000, height: 1000 }, this.scene);
		carGround.visibility = 0;
		carGround.physicsImpostor = new PhysicsImpostor(carGround, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);
		carGround.physicsImpostor.physicsBody.collisionFilterMask = 2;
		this.carGround = carGround;
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

		this.createCarCollider(carMesh);
	}

	private createCarCollider(carMesh: AbstractMesh): void {
		const carCollider = MeshBuilder.CreateBox('carCollider', {
			width: 3.5,
			height: 1,
			depth: 1.5,
		});
		carCollider.position.y = 0.5;
		carCollider.visibility = 0;

		carCollider.physicsImpostor = new PhysicsImpostor(carCollider, PhysicsImpostor.BoxImpostor, {
			mass: 10,
			restitution: 0,
			friction: 0,
		}, this.scene);

		carCollider.physicsImpostor.physicsBody.linearDamping = 0.5;

		// eslint-disable-next-line no-bitwise
		carCollider.physicsImpostor.physicsBody.collisionFilterGroup = 1 | 2;

		carMesh.setParent(carCollider);
		this.carCollider = carCollider;
	}

	private initializeSceneActions(): void {
		this.scene.onPointerObservable.add(pointerInfo => {
			const { type, pickInfo } = pointerInfo;
			if (type === PointerEventTypes.POINTERPICK && pickInfo?.pickedPoint) {
				const gameAreaSize = 50;
				const isClickInGameArea = Math.abs(pickInfo.pickedPoint.x) < gameAreaSize &&
					Math.abs(pickInfo.pickedPoint.z) < gameAreaSize;
				const isGroundClicked = this.carGround === pickInfo.pickedMesh;

				if (isClickInGameArea && isGroundClicked && this.carCollider) {
					this.moveCarToPoint(this.carCollider, pickInfo.pickedPoint);
				}
			}
		});
	}

	private moveCarToPoint(carMesh: Mesh, pickedPoint: Vector3): void {
		const vector = pickedPoint.subtract(carMesh.position);
		carMesh.physicsImpostor?.setLinearVelocity(vector);

		const angleRadians = -Math.atan2(
			carMesh.position.z - pickedPoint.z,
			carMesh.position.x - pickedPoint.x,
		);

		carMesh.rotation = new Vector3(0, angleRadians, 0);
	}

	private createScenePhysics(): void {
		const gravityConstant = -9.81;
		const gravityVector = new Vector3(0, gravityConstant, 0);
		this.scene.enablePhysics(gravityVector, new CannonJSPlugin(true, 10, CANNON));
	}

	private createBoxImpostor(): void {
		const size = 3;
		const box = MeshBuilder.CreateBox('box', { size });
		box.position = new Vector3(5, size / 2, 5);

		box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {
			mass: 10,
			restitution: 0.5,
		}, this.scene);
	}

	private createSphereImpostor(): void {
		const diameter = 3;
		const sphere = MeshBuilder.CreateSphere('sphere', { diameter });
		sphere.position = new Vector3(-5, diameter / 2, -5);

		sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
			mass: 20,
			restitution: 0,
		}, this.scene);
	}
}
