import {
	AbstractMesh, Angle, GroundMesh, Mesh, MeshBuilder,
	PhysicsImpostor, PointerEventTypes, Scene, SceneLoader, Vector3,
} from '@babylonjs/core';
import { carModelPath } from 'assets/models';

/** Car creator. */
export class CarCreator {
	public constructor(
		private readonly scene: Scene,
	) { }

	/** Initialize car object. */
	public async initializeCar(): Promise<void> {
		const carMesh = await this.createCarWithCollider();

		if (carMesh) {
			const carGround = this.createCarGround();
			this.initializeSceneActions(carMesh, carGround);
		}
	}

	private async createCarWithCollider(): Promise<Mesh | null> {
		const { meshes } = await SceneLoader.ImportMeshAsync('', carModelPath, '', this.scene);
		const carMesh = meshes[0];
		if (carMesh != null) {
			carMesh.rotation = new Vector3(0, Angle.FromDegrees(90).radians(), 0);
			return this.createCarCollider(carMesh);
		}

		return null;
	}

	private createCarCollider(carMesh: AbstractMesh): Mesh {
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
		return carCollider;
	}

	private createCarGround(): GroundMesh {
		const groundSize = 1000;
		const carGround = MeshBuilder.CreateGround('carGround', { width: groundSize, height: groundSize }, this.scene);
		carGround.visibility = 0;
		carGround.physicsImpostor = new PhysicsImpostor(carGround, PhysicsImpostor.BoxImpostor, {
			mass: 0,
			restitution: 0,
		}, this.scene);
		carGround.physicsImpostor.physicsBody.collisionFilterMask = 2;

		return carGround;
	}

	private initializeSceneActions(car: Mesh, carGround: GroundMesh): void {
		this.scene.onPointerObservable.add(pointerInfo => {
			const { type, pickInfo } = pointerInfo;
			if (type === PointerEventTypes.POINTERPICK && pickInfo?.pickedPoint) {
				const gameAreaSize = 50;
				const isClickInGameArea = Math.abs(pickInfo.pickedPoint.x) < gameAreaSize &&
					Math.abs(pickInfo.pickedPoint.z) < gameAreaSize;
				const isGroundClicked = carGround === pickInfo.pickedMesh;

				if (isClickInGameArea && isGroundClicked && car) {
					this.moveCarToPoint(car, pickInfo.pickedPoint);
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
}
