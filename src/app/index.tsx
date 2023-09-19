import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

/** Start React app. */
export function startReactApp(): void {
	const appElement = document.getElementById('app');

	if (appElement === null) {
		throw new Error('#app element is missing.');
	}

	const root = createRoot(appElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
