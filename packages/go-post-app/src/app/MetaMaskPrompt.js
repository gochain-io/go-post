import React, { Component } from 'react';
import { Avatar, Grid, Paper, Typography, withStyles } from '@material-ui/core';
import LockIcon from '@material-ui/icons/LockOutlined';
import { errorType } from '../redux/contracts';

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
    marginTop: theme.spacing.unit * 4,
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
});

class MetaMaskPrompt extends Component {
  render() {
    const { props } = this;
    const { classes, metaMaskErrorType } = props;

    let title = 'Connection Error';
    let subtitle = 'An unknown error occurred while connecting to the GoChain network.';

    if (metaMaskErrorType === errorType.METAMASK_LOCKED) {
      title = 'MetaMask Locked';
      subtitle = 'Please unlock your MetaMask account to start using Go Post.';
    } else if (metaMaskErrorType === errorType.NO_METAMASK) {
      title = 'Install MetaMask';
      subtitle = 'To use Go Post, you\'ll need to install MetaMask and configure it for the GoChain network.';
    } else if (metaMaskErrorType === errorType.NETWORK)  {
      title = 'Connection Error';
      subtitle = 'Couldn\'t connect to the GoChain network. Check your Internet connection.';
    } else if (metaMaskErrorType === errorType.DISCONNECTED) {
      title = 'Lost Connection';
      subtitle = 'Lost connection to the GoChain network. Check your Internet connection.';
    }

    return (
      <Grid container justify="center" alignItems="stretch" direction="column" className={classes.page}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className={classes.title}>
            {title}
          </Typography>
          <Typography variant="body2" color="inherit" paragraph className={classes.subtitle}>
            {subtitle}
          </Typography>
        </Paper>
      </Grid>
    );
  }
}

export default withStyles(styles)(MetaMaskPrompt);
