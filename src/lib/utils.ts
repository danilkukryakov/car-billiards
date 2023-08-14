/**
 * Get random integer value inclusive.
 * Implementation is taken from MDN docs:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random.
 * @param min Min value.
 * @param max Max value.
 */
export function getRandomIntInclusive(min: number, max: number): number {
	const minInt = Math.ceil(min);
	const maxInt = Math.floor(max);
	return Math.floor(Math.random() * (maxInt - minInt + 1) + minInt);
}
