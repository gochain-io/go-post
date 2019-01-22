// @flow

import { CssBaseline, Grid, withStyles, CircularProgress } from '@material-ui/core';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';

import './App.css';

import HomePage from './HomePage';
import UserPage from './user/UserPage';
import SetUsernamePage from './profile/SetUsernamePage';
import { initContracts } from '../redux/contracts';
import MetaMaskPrompt from './MetaMaskPrompt';

const mapStateToProps = state => ({
  isConnected: state.contracts.isConnected,
  user: state.profile.user,
  metaMaskErrorType: state.contracts.errorType,
  noUsername: state.profile.isFetched && !state.profile.username,
});

const mapDispatchToProps = {
  initContracts,
};

const theme = createMuiTheme({
  direction: 'ltr',
  paletteType: 'light',
  palette: {
    primary: blue,
    secondary: {
      main: red[500],
    },
  },
  typography: {
    useNextVariants: true,
  },
});

const styles = theme => ({
  spinner: {
    margin: theme.spacing.unit * 8,
  },
});

const UsernameSetRoute = ({ component: Component, noUsername, ...rest }) => (
  <Route {...rest} render={(props) => (
    noUsername
      ? <Redirect to="/set-username" />
      : <Component {...props} />
  )} />
)

class AppInner extends Component {
  componentWillMount() {
    this.props.initContracts();
  }

  render() {
    const props = this.props;
    const { classes, noUsername } = props;

    return (
      <React.Fragment>
        <CssBaseline />
        <Router>
          <React.Fragment>
            {props.isConnected ? (
              <React.Fragment>
                <UsernameSetRoute exact={true} path="/" component={HomePage} />
                <UsernameSetRoute noUsername={noUsername} exact={true} path="/users/:user" component={UserPage} />
                <Route exact={true} path="/set-username" component={SetUsernamePage} />
              </React.Fragment>
            ) : (props.metaMaskErrorType ? (
              <MetaMaskPrompt metaMaskErrorType={props.metaMaskErrorType} />
            ) : (
              <Grid container justify="center">
                <Grid item>
                  <CircularProgress className={classes.spinner} />
                </Grid>
              </Grid>
            ))}
          </React.Fragment>
        </Router>
      </React.Fragment>
    )
  }
}

const AppInnerStyled = withStyles(styles)(AppInner)
const AppInnerConnected = connect(mapStateToProps, mapDispatchToProps)(AppInnerStyled);

const App = props => (
  <MuiThemeProvider theme={theme}>
    <AppInnerConnected />
  </MuiThemeProvider>
);

export default App;
