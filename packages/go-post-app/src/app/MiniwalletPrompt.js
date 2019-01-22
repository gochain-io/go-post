import BN from 'bn.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Grid, Typography, withStyles } from '@material-ui/core';
import Restore from '@material-ui/icons/Restore';
import { hideMiniwalletPrompt } from '../redux/miniwallet';
import SimplePrompt from '../components/SimplePrompt';

const styles = theme => ({
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
        <SimplePrompt avatar={<Restore />} title={title}>
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
        </SimplePrompt>
      );
    } else {
      return props.children;
    }
  }
}

const MiniwalletPromptStyled = withStyles(styles)(MiniwalletPrompt);
export { MiniwalletPromptStyled as MiniwalletPromptUnconnected };

export default connect(mapStateToProps, mapDispatchToProps)(MiniwalletPromptStyled);
