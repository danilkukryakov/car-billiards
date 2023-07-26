import { Color3, HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

/** Main light of the scene. */
export class MainLight {
	/**
	 * Creates main light of the scene.
	 * @param scene Scene.
	 */
	public static create(scene: Scene): void {
		const hemiLight = new HemisphericLight('mainLight', new Vector3(0, 2, 0), scene);
		hemiLight.specular = Color3.White();
	}
}
