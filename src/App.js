import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as request from "request";

class App extends React.Component{
  componentDidMount() {
    request.get('https://hac.mckinneyisd.net/HomeAccess/Classes/Classwork', {
      'auth': {
        'LogOnDetails.UserName:': 's203295',
        'LogOnDetails.Password:': 'Llambda3ean$1218',
        'sendImmediately': false
      }
    });
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header>
        </div>
    );
  }
}

export default App;
