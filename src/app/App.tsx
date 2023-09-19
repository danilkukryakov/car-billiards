import { useRef, useEffect } from 'react';
import { MainScene } from 'lib';

import { GameForm } from './components/GameForm';
import { GameSettings } from './models/game-settings';

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

	const handleGameStart = (settings: GameSettings): void => {
		// TODO: Implement game restart with applied settings.
		// eslint-disable-next-line no-console
		console.log(settings);
	};

	return (
		<main className={styles.root}>
			<canvas className={styles.scene} ref={canvasRef} />
			<div className={styles.gameForm}>
				<GameForm onGameStart={handleGameStart} />
			</div>
		</main>
	);
};
