import React, { Component } from 'react';
import logo from './OpenChemistry_Logo.svg';
import './App.css';

import { Benzene, BenzeneWithHomo, Caffeine } from '@openchemistry/sample-data';
import { FormControl, Select, MenuItem, AppBar, Toolbar, Button } from '@material-ui/core';

import { wc } from './utils/webcomponent';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      molecules: {
        'caffeine': {label: 'Caffeine', cjson: Caffeine},
        'benzene': {label: 'Benzene', cjson: Benzene},
        'benzeneWithHomo': {label: 'Benzene with HOMO', cjson: BenzeneWithHomo}
      },
      activeMolecule: 'caffeine'
    }
  }

  handleMoleculeChange = (event) => {
    this.setState({...this.state, ...{activeMolecule: event.target.value}});
  }

  render() {
    let selectOptions = [];
    for (let key in this.state.molecules) {
      selectOptions.push(<MenuItem key={key} value={key}>{this.state.molecules[key].label}</MenuItem>);
    }
    return (
      <div>
        <AppBar color="default" position="fixed">
          <Toolbar>
            <Button color="inherit" aria-label="Logo" style={{marginRight: 9}}>
              <img className='oc-logo' src={logo} alt="logo" />
            </Button>
          </Toolbar>
        </AppBar>
        <div className="content">
          <div className="molecule-container">
            <oc-molecule
              ref={wc(
                {},
                {
                  cjson: this.state.molecules[this.state.activeMolecule].cjson
                }
              )}
            />
          </div>
          <FormControl>
            <Select
              value={this.state.activeMolecule}
              onChange={this.handleMoleculeChange}
              displayEmpty
              name="molecule"
            >
              {selectOptions}
            </Select>
          </FormControl>
        </div>
      </div>
    );
  }
}

export default App;
