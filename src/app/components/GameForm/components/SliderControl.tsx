import { memo } from 'react';
import { Grid, Slider, SliderProps } from '@mui/material';

interface SliderControlProps {

	/** Label. */
	readonly label: string;

	/** Value. */
	readonly value: number;

	/** Max value. */
	readonly maxValue: number;

	/** On slider value change. */
	readonly onChange: (value: number) => void;
}

const SliderControlComponent: React.FC<SliderControlProps> = ({
	label,
	value,
	maxValue,
	onChange,
}) => {
	const handleSliderChange: SliderProps['onChange'] = (_, newValue) => {
		if (typeof newValue === 'number') {
			return onChange(newValue);
		}
	};

	return (
		<Grid container spacing={2}>
			<Grid item xs={4} textAlign='right'>
				{label}
			</Grid>
			<Grid item xs={6}>
				<Slider
					size='small'
					value={value}
					max={maxValue}
					onChange={handleSliderChange} />
			</Grid>
			<Grid item xs={2}>
				{value}
			</Grid>
		</Grid>
	);
};

/** Slider control component. */
export const SliderControl = memo(SliderControlComponent);
