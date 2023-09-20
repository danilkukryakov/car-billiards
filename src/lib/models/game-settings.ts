/** Game settings. */
export interface GameSettings {

	/** Cubes count. */
	readonly cubesCount: number;

	/** Spheres count. */
	readonly spheresCount: number;
}

/** Max items count. */
export const MAX_ITEMS_COUNT = 30;

/** Default game setting. */
export const DEFAULT_SETTINGS: GameSettings = {
	cubesCount: MAX_ITEMS_COUNT / 2,
	spheresCount: MAX_ITEMS_COUNT / 2,
};
