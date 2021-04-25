import React, { Fragment, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Griddler from './src/index';

function App() {
    return <Griddler />;
}

var mountNode = document.getElementById('inject-here');
ReactDOM.render(<App />, mountNode);