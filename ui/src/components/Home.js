import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export class Home extends Component {
  static displayName = Home.name;

  render () {
    return (
        <div className="container">
            <div className="card-deck mb-3 text-center">
                <div className="card mb-4 box-shadow">
                    <div className="card-header">
                        <h4 className="my-0 font-weight-normal">Registration</h4>
                    </div>
                    <div className="card-body">
                        <h1 className="card-title pricing-card-title"><small className="text-muted"></small></h1>
                        <ul className="list-unstyled mt-3 mb-4">
                            <li>Register for shots</li>
                            <li>Enter your information</li>
                            <li>Get registration code</li>
                        </ul>
                        <Link to="/register" className="btn btn-lg btn-block btn-primary">Register</Link>
                    </div>
                </div>
           </div>
        </div>
    );
  }
}
