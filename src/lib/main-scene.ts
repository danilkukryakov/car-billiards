import {
	CannonJSPlugin, CubeTexture, Engine,
	MeshBuilder, PhysicsImpostor, Scene, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import * as CANNON from 'cannon';

import { environmentTexturePath } from 'assets/environment';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import { PbrMaterials } from './materials';
import { DEFAULT_SETTINGS, GameSettings } from './models/game-settings';
import { ObjectsCreator } from './objects-creator';
import { CarCreator } from './car-creator';

/** Main scene of the app. */
export class MainScene {

	private readonly engine: Engine;

	private readonly scene: Scene;

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
		this.initializeSceneSkybox();
		this.initializeScenePhysics();
		this.initializeSceneGround();

		const carCreator = new CarCreator(this.scene);
		carCreator.initializeCar();

		const objectsCreator = new ObjectsCreator(this.scene);
		objectsCreator.initializeObjects(settings);
	}

	private initializeSceneSkybox(): void {
		const environmentTexture = CubeTexture.CreateFromPrefilteredData(
			environmentTexturePath,
			this.scene,
		);
		this.scene.environmentTexture = environmentTexture;
		this.scene.createDefaultSkybox(environmentTexture, true, 1000, 0.1);
	}

	private initializeSceneGround(): void {
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

	private initializeScenePhysics(): void {
		const gravityConstant = -9.81;
		const gravityVector = new Vector3(0, gravityConstant, 0);
		this.scene.enablePhysics(gravityVector, new CannonJSPlugin(true, 10, CANNON));
	}
}
