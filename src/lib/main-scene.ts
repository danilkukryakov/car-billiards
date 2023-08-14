import {
	AbstractMesh, Angle, CannonJSPlugin, CubeTexture,
	Engine, GroundMesh, Material, Mesh, MeshBuilder,
	PhysicsImpostor, PointerEventTypes, Scene,
	SceneLoader, Vector2, Vector3,
} from '@babylonjs/core';
import '@babylonjs/loaders';
import * as CANNON from 'cannon';

import { environmentTexturePath } from 'assets/environment';
import { carModelPath } from 'assets/models';

import { MainLight } from './main-light';
import { MainCamera } from './main-camera';
import { PbrMaterials } from './materials';
import { getRandomIntInclusive } from './utils';

/** Main scene of the app. */
export class MainScene {

	private readonly engine: Engine;

	private readonly scene: Scene;

	private carGround?: GroundMesh;

	private objectsDestroyerGround?: GroundMesh;

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
		this.createObjectDestroyerGround();
		this.createCar();
		this.initializeSceneActions();
		this.createObjects();
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
		const material = PbrMaterials.createGroundMaterial(this.scene);
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

	private createObjectDestroyerGround(): void {
		const ground = MeshBuilder.CreateGround('objectDestroyerGround', { width: 1000, height: 1000 }, this.scene);
		ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
			mass: 0,
		}, this.scene);
		ground.visibility = 0;
		ground.position.y = -20;
		this.objectsDestroyerGround = ground;
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

	private createObjects(): void {
		const objectsCount = getRandomIntInclusive(10, 20);
		const coordinates = this.getCoordinates(objectsCount);

		const woodMaterial = PbrMaterials.createWoodMaterial(this.scene);
		const grainedWoodMaterial = PbrMaterials.createGrainedWoodMaterial(this.scene);

		coordinates.forEach(item => {
			const isBox = getRandomIntInclusive(-1, 1) > 0;
			const isGrainedWood = getRandomIntInclusive(-1, 1) > 0;
			const material = isGrainedWood ? grainedWoodMaterial : woodMaterial;

			if (isBox) {
				this.createBoxImpostor(item, material);
			} else {
				this.createSphereImpostor(item, material);
			}
		});
	}

	private createBoxImpostor(position: Vector2, material?: Material): Mesh {
		const size = getRandomIntInclusive(1, 5);
		const box = MeshBuilder.CreateBox('box', { size });
		box.position = new Vector3(position.x, size / 2, position.y);

		box.physicsImpostor = new PhysicsImpostor(box, PhysicsImpostor.BoxImpostor, {
			mass: size * 2,
			restitution: size / 10,
		}, this.scene);

		box.material = material ?? null;

		this.registerDestroyCollider(box);
		return box;
	}

	private createSphereImpostor(position: Vector2, material?: Material): void {
		const diameter = getRandomIntInclusive(1, 5);
		const sphere = MeshBuilder.CreateSphere('sphere', { diameter });
		sphere.position = new Vector3(position.x, diameter / 2, position.y);

		sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
			mass: diameter * 5,
			restitution: 0,
		}, this.scene);

		sphere.material = material ?? null;

		this.registerDestroyCollider(sphere);
	}

	private registerDestroyCollider(mesh: Mesh): void {
		if (this.objectsDestroyerGround?.physicsImpostor) {
			mesh.physicsImpostor?.registerOnPhysicsCollide(this.objectsDestroyerGround.physicsImpostor, () => {
				mesh.dispose();
			});
		}
	}

	private getCoordinates(count: number): Vector2[] {
		const array: Vector2[] = [];
		const playerSafeZoneOffset = 5;
		const tileSize = 5;
		const upperBorder = 25;

		for (let x = playerSafeZoneOffset; x < upperBorder; x += tileSize) {
			for (let y = playerSafeZoneOffset; y < upperBorder; y += tileSize) {
				array.push(new Vector2(x, y));
				array.push(new Vector2(x, -y));
				array.push(new Vector2(-x, y));
				array.push(new Vector2(-x, -y));
			}
		}

		return array.sort(() => getRandomIntInclusive(-1, 1)).slice(0, count);
	}
}
