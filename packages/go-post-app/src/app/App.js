// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';

import { init } from '../redux/contracts';
import NewPost from './NewPost';
import UserPage from './user/UserPage';

const mapStateToProps = state => ({
  isConnected: state.contracts.isConnected,
});

const mapDispatchToProps = {
  init,
};

class AppUnconnected extends Component {
  componentWillMount() {
    this.props.init();
  }

  render() {
    const props = this.props;

    return props.isConnected ? (
      <Router>
        <div>
          <p>Top bar</p>
          <Route exact={true} path="/new-post" component={NewPost} />
          <Route exact={true} path="/users/:username" component={UserPage} />
        </div>
      </Router>
    ) : (
      <p>No MetaMask yet.</p>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppUnconnected);
