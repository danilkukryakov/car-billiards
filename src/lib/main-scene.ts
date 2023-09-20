import {
	AbstractMesh, Angle, CannonJSPlugin, CubeTexture,
	Engine, GroundMesh, Mesh, MeshBuilder,
	PhysicsImpostor, PointerEventTypes, Scene,
	SceneLoader, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import * as CANNON from 'cannon';

import { environmentTexturePath } from 'assets/environment';
import { carModelPath } from 'assets/models';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import { PbrMaterials } from './materials';
import { DEFAULT_SETTINGS, GameSettings } from './models/game-settings';
import { ObjectsCreator } from './objects-creator';

/** Main scene of the app. */
export class MainScene {

	private readonly engine: Engine;

	private readonly scene: Scene;

	private carGround?: GroundMesh;

	private carCollider?: Mesh;

	public constructor(canvas: HTMLCanvasElement, gameSettings = DEFAULT_SETTINGS) {
		this.engine = new Engine(canvas);
		this.scene = new Scene(this.engine);

		this.initializeScene(gameSettings);
		this.engine.runRenderLoop(() => this.scene.render());
	}

	/** Erase 3D related resources. */
	public erase(): void {
		this.scene.dispose();
		this.engine.dispose();
	}

	private initializeScene(settings: GameSettings): void {
		MainCamera.create(this.scene);
		MainLight.create(this.scene);
		this.createSkybox();
		this.createScenePhysics();
		this.createGround();
		this.createCarGround();
		this.createCar();
		this.initializeSceneActions();
		const objectsCreator = new ObjectsCreator(this.scene);
		objectsCreator.createObjects(settings);
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
		const groundSize = 50;
		const ground = MeshBuilder.CreateGround('ground', { width: groundSize, height: groundSize }, this.scene);
		const material = PbrMaterials.createGroundMaterial(this.scene);
		ground.material = material;
		ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);
		ground.isPickable = false;
	}

	private createCarGround(): void {
		const groundSize = 1000;
		const carGround = MeshBuilder.CreateGround('carGround', { width: groundSize, height: groundSize }, this.scene);
		carGround.visibility = 0;
		carGround.physicsImpostor = new PhysicsImpostor(carGround, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);
		carGround.physicsImpostor.physicsBody.collisionFilterMask = 2;
		this.carGround = carGround;
	}

	private async createCar(): Promise<void> {
		const { meshes } = await SceneLoader.ImportMeshAsync('', carModelPath, '', this.scene);
		const carMesh = meshes[0];
		if (carMesh != null) {
			carMesh.rotation = new Vector3(0, Angle.FromDegrees(90).radians(), 0);
			this.createCarCollider(carMesh);
		}
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
}
