import BN from 'bn.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { withStyles } from '@material-ui/core';
import TopBar from './TopBar';

const styles = theme => ({
});

const mapStateToProps = state => ({
  parentAccount: state.contracts.account,
  username: state.profile.username,
  profileIsFetched: state.profile.isFetched,
});

class HomePage extends Component {

  render() {
    const { props } = this;
    const { classes } = props;

    const user = props.username || props.parentAccount;

    return props.profileIsFetched
      ? <Redirect to={`/users/${user}`} />
      : <TopBar />;
  }
}

export default withStyles(styles)(connect(mapStateToProps)(HomePage));
