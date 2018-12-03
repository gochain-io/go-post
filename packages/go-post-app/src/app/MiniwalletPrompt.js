import BN from 'bn.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Avatar, Button, Grid, Paper, Typography, withStyles } from '@material-ui/core';
import Restore from '@material-ui/icons/Restore';
import { hideMiniwalletPrompt } from '../redux/miniwallet';

const styles = theme => ({
  page: {
    marginTop: theme.spacing.unit * 4,
    [theme.breakpoints.up(450 + theme.spacing.unit * 3 * 2)]: {
      width: 450,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 4}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
  subtitle: {
    lineHeight: 1.5,
  },
  button: {
    marginTop: theme.spacing.unit * 2,
  },
});

const mapStateToProps = state => ({
  firstTime: state.miniwallet.cachedWalletBalance.eq(new BN(0)),
  newAccount: state.miniwallet.cachedAccountBalance.eq(new BN(0)),
  isPromptVisible: state.miniwallet.isPromptVisible,
});

const mapDispatchToProps = {
  hideMiniwalletPrompt,
};

class MiniwalletPrompt extends Component {
  render() {
    const { props } = this;
    const { classes, firstTime, newAccount, isPromptVisible } = props;

    let title = 'Load Your Wallet';
    let subtitle = 'Load a small amount of GO into your Go Post wallet to perform this action.';
    let buttonTitle = 'Load Wallet';

    if (firstTime) {
      title = 'Set Up Wallet';
      subtitle = 'Load a small amount of GO into your Go Post wallet to start using the app.';
      buttonTitle = 'Load Wallet';
    } else if (newAccount) {
      title = 'Activate Wallet';
      subtitle = 'You\'ve cleared your browser data since last using Go Post and will need to re-activate your wallet.';
      buttonTitle = 'Activate Wallet';
    }

    if (isPromptVisible) {
      return (
        <Grid container justify="center" alignItems="stretch" direction="column" className={classes.page}>
          <Paper className={classes.paper}>
            <Avatar className={classes.avatar}>
              <Restore />
            </Avatar>
            <Typography component="h1" variant="h5" className={classes.title}>
              {title}
            </Typography>
            <Typography variant="body2" color="inherit" paragraph className={classes.subtitle}>
              {subtitle}
            </Typography>
            <Grid container justify="center">
              <Grid item>
                <Button variant="contained" color="primary" className={classes.button} onClick={props.hideMiniwalletPrompt}>
                  {buttonTitle}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      );
    } else {
      return props.children;
    }
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(MiniwalletPrompt));
