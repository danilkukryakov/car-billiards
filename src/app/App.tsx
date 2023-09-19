import { useRef, useEffect } from 'react';
import { MainScene } from 'lib';

import { GameForm } from './GameForm';

import styles from './App.module.css';

/** App root component. */
export const App: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const scene = useRef<MainScene | null>(null);

	useEffect(() => {
		if (canvasRef.current != null) {
			scene.current = new MainScene(canvasRef.current);
		}

		return () => scene.current?.erase();
	}, []);

	return (
		<main className={styles.root}>
			<canvas className={styles.scene} ref={canvasRef} />
			<div className={styles.gameForm}>
				<GameForm />
			</div>
		</main>
	);
};
