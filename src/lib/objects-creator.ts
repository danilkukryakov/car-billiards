import {
	Vector2, Mesh, MeshBuilder, Vector3,
	PhysicsImpostor, Scene, Material, GroundMesh,
} from '@babylonjs/core';

import { getRandomIntInclusive } from './utils';
import { PbrMaterials } from './materials';
import { GameSettings } from './models/game-settings';

/** Objects creator. */
export class ObjectsCreator {

	private readonly destroyerGround = this.createObjectDestroyerGround();

	public constructor(
		private readonly scene: Scene,
	) { }

	/**
	 * Create game object.
	 * @param settings Game settings.
	 */
	public initializeObjects(settings: GameSettings): void {
		const objectsCount = settings.cubesCount + settings.spheresCount;
		const coordinates = this.getCoordinates(objectsCount);

		this.initializeCubes(coordinates.splice(0, settings.cubesCount));
		this.initializeSpheres(coordinates.slice(0, settings.spheresCount));
	}

	private initializeCubes(coordinates: readonly Vector2[]): void {
		const woodMaterial = PbrMaterials.createWoodMaterial(this.scene);

		coordinates.forEach(coord => {
			const mesh = this.createBoxImpostor(coord, woodMaterial);
			this.registerDestroyCollider(mesh);
		});
	}

	private initializeSpheres(coordinates: readonly Vector2[]): void {
		const grainedWoodMaterial = PbrMaterials.createGrainedWoodMaterial(this.scene);

		coordinates.map(coord => {
			const mesh = this.createSphereImpostor(coord, grainedWoodMaterial);
			this.registerDestroyCollider(mesh);
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

		return box;
	}

	private createSphereImpostor(position: Vector2, material?: Material): Mesh {
		const diameter = getRandomIntInclusive(1, 5);
		const sphere = MeshBuilder.CreateSphere('sphere', { diameter });
		sphere.position = new Vector3(position.x, diameter / 2, position.y);

		sphere.physicsImpostor = new PhysicsImpostor(sphere, PhysicsImpostor.SphereImpostor, {
			mass: diameter * 5,
			restitution: 0,
		}, this.scene);

		sphere.material = material ?? null;

		return sphere;
	}

	private getCoordinates(count: number): Vector2[] {
		const array: Vector2[] = [];
		const tileSize = 5;
		const playerSafeZoneOffset = (tileSize / 2) + 1;
		const upperBorder = 25;

		for (let x = 0; x < upperBorder; x += tileSize) {
			for (let y = 0; y < upperBorder; y += tileSize) {
				if (Math.abs(x) <= playerSafeZoneOffset && Math.abs(y) <= playerSafeZoneOffset) {
					continue;
				}

				array.push(new Vector2(x, y));
				array.push(new Vector2(-x, -y));

				if (x !== 0 && y !== 0) {
					array.push(new Vector2(-x, y));
					array.push(new Vector2(x, -y));
				}
			}
		}

		return array.sort(() => getRandomIntInclusive(-1, 1)).slice(0, count);
	}

	private createObjectDestroyerGround(): GroundMesh {
		const groundSize = 1000;
		const ground = MeshBuilder.CreateGround('objectDestroyerGround', { width: groundSize, height: groundSize }, this.scene);
		ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {
			mass: 0,
		}, this.scene);
		ground.visibility = 0;
		ground.position.y = -20;
		return ground;
	}

	private registerDestroyCollider(mesh: Mesh): void {
		if (this.destroyerGround?.physicsImpostor) {
			mesh.physicsImpostor?.registerOnPhysicsCollide(this.destroyerGround.physicsImpostor, () => {
				mesh.dispose();
			});
		}
	}
}
