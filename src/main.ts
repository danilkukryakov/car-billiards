import './style.css';
import { setupCounter } from './counter.ts';

const appElement = document.querySelector<HTMLDivElement>('#app');
if (appElement === null) {
	throw new Error('App root element is missing.');
}

appElement.innerHTML = `
  <div>
    <h1>Car Billiards</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`;

const counterElement = document.querySelector<HTMLButtonElement>('#counter');
if (counterElement) {
	setupCounter(counterElement);
}
