/// <reference types="vite/client" />

declare module '*.env' {
	const src: string;
	export default src;
}

declare module '*.glb' {
	const src: string;
	export default src;
}
