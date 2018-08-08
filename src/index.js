import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import {defineCustomElements as defineMolecule} from '@openchemistry/molecule';

defineMolecule(window);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
