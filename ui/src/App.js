import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
//import { FetchData } from './components/FetchData';
import Patient, { Insured, Complete, Prompt } from './components/Counter';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

  render () {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
            <Route path='/register' component={Patient} />
            <Route path='/insured' component={Insured} />
            <Route path='/complete' component={Complete} />
      </Layout>
    );
  }
}
