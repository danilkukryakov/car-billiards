import { memo, useState } from 'react';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { GameSettings } from 'app/models/game-settings';

import { SliderControl } from './components';

const MAX_ITEMS_COUNT = 50;

interface GameFormProps {

	/** On game start event. */
	readonly onGameStart: (settings: GameSettings) => void;
}

const GameFormComponent: React.FC<GameFormProps> = ({
	onGameStart,
}) => {
	const [gameSettings, setGameSettings] = useState<GameSettings>({
		cubesCount: MAX_ITEMS_COUNT / 2,
		spheresCount: MAX_ITEMS_COUNT / 2,
	});

	const patchFormSettings = (values: Partial<GameSettings>): void => {
		setGameSettings({
			...gameSettings,
			...values,
		});
	};

	return (
		<Card sx={{ minWidth: 300 }}>
			<CardContent>
				<Typography variant="h5" align='center' marginBottom={2}>
					Car Billiards
				</Typography>

				<Stack>
					<SliderControl
						label="Cubes"
						value={gameSettings.cubesCount}
						maxValue={MAX_ITEMS_COUNT}
						onChange={cubesCount => patchFormSettings({ cubesCount })}
					/>
					<SliderControl
						label="Spheres"
						value={gameSettings.spheresCount}
						maxValue={MAX_ITEMS_COUNT}
						onChange={spheresCount => patchFormSettings({ spheresCount })}
					/>
					<Button
						sx={{ marginTop: 1 }}
						variant="contained"
						onClick={() => onGameStart(gameSettings)}
					>
						Start
					</Button>
				</Stack>
			</CardContent>
		</Card>
	);
};

/** Game form. */
export const GameForm = memo(GameFormComponent);
