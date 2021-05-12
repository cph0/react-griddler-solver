import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Griddler from './src/index';
import { griddlers } from './src/data/index';

function App() {

    const [sG, setSg] = useState(32);
    const griddler = griddlers[sG];

    const onSelectGriddler = (event) => {
        setSg(parseInt(event.target.value));
    }

    const renderGriddlerList = () => {
        let html = null;
        let items = [];

        items = griddlers.map((g, i) => <option key={g.name} value={i}>{g.name}</option>);

        html = (
            <select className="form-control" onChange={(e) => onSelectGriddler(e)} value={sG}>
                {items}
            </select>
        );

        return html;
    }

    return (
        <>
            <div className="row">
                <div className="col-md-6">
                    {renderGriddlerList()}
                </div>
            </div>
            <div className="row">
                <div className="col" style={{ overflowY: "auto", height: "calc(78vh)" }}>                    
                    {/*griddlers.map(griddler => <Griddler griddler={griddler} />)*/}
                    <Griddler griddler={griddler} />
                </div>
            </div>
        </>
    );
}

var mountNode = document.getElementById('inject-here');
ReactDOM.render(<App />, mountNode);