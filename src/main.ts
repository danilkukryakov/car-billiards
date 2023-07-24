import './style.css';
import { MainScene } from './lib';

const canvasElement = document.querySelector<HTMLCanvasElement>('#canvas');
if (canvasElement === null) {
	throw new Error('Canvas element is missing.');
}

new MainScene(canvasElement).render();
