import { Angle, ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';

/** Main camera of the scene. */
export class MainCamera {
	/**
	 * Creates main camera of the scene.
	 * @param scene Scene.
	 */
	public static create(scene: Scene): void {
		const beta = Angle.FromDegrees(45).radians();
		const camera = new ArcRotateCamera('mainCamera', 0, beta, 70, Vector3.Zero(), scene);
		camera.speed = 0.3;
		camera.upperBetaLimit = Angle.FromDegrees(75).radians();
		camera.lowerRadiusLimit = 10;
		camera.upperRadiusLimit = 70;
		camera.attachControl();
	}
}
