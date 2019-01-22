import React, { Component } from 'react';
import { Typography, withStyles } from '@material-ui/core';
import LockIcon from '@material-ui/icons/LockOutlined';
import { errorType } from '../redux/contracts';
import SimplePrompt from '../components/SimplePrompt';

const styles = theme => ({
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
      <SimplePrompt avatar={<LockIcon />} title={title}>
        <Typography variant="body2" color="inherit" paragraph className={classes.subtitle}>
          {subtitle}
        </Typography>
      </SimplePrompt>
    );
  }
}

export default withStyles(styles)(MetaMaskPrompt);
