import { Scene, UniversalCamera, Vector3 } from '@babylonjs/core';

/** Main camera of the scene. */
export class MainCamera {
	/**
	 * Creates main camera of the scene.
	 * @param scene Scene.
	 */
	public static create(scene: Scene): void {
		const camera = new UniversalCamera('mainCamera', new Vector3(0, 1, 0), scene);
		camera.attachControl();
	}
}
