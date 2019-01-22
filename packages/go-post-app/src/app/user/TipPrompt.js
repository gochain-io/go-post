import BN from 'bn.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Grid, Paper, TextField, Typography, withStyles } from '@material-ui/core';
import { fetchParentAccountBalance } from './user';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 5,
  },
  textField: {
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    marginRight: theme.spacing.unit * 2,
  },
});

const mapStateToProps = state => ({
  parentAccountBalance: state.user.parentAccountBalance,
});

const mapDispatchToProps = {
  fetchParentAccountBalance,
};

const minimumTip = 0.1;

class TipPrompt extends Component {
  state = {
    submitError: null,
  };

  onSubmit = event => {
    event.preventDefault();
    const { value } = this.input;
    const trimmed = value.trim();
    let num = Number(trimmed);
    if (!trimmed || isNaN(num)) {
      this.setState({ submitError: 'Enter an amount of GO to send.' });
      return;
    }

    if (num < minimumTip) {
      this.setState({ submitError: `Must be at least ${minimumTip} GO.` });
      return;
    }
    // Exponent here plus exponent below MUST equal 18. e.g. 4 + 14 = 18.
    // We do this because BN doesn't support decimals.
    num = Math.floor(num * 1e4);
    const bigNum = new BN(10).pow(new BN(14)).mul(new BN(num));

    // Handle not having enough GO.
    const balance = this.props.parentAccountBalance;
    if (balance && balance.lt(bigNum)) {
      const niceBalance = balance.div(new BN(10).pow(new BN(16))).toNumber() / 1e2;
      this.setState({ submitError: `You only have ${niceBalance} GO.` });
      return;
    }

    this.props.tip(this.props.tippingPostId, bigNum);
    this.input.value = '';
  };

  componentWillMount() {
    this.props.fetchParentAccountBalance();
  }

  componentDidMount() {
    this.input.focus();
  }

  render() {
    const { props } = this;
    const { classes } = props;

    return (
      <Paper className={classes.paper}>
      <Typography variant="h4">Send Tip</Typography>
        <p>How much GO would you like to send to <strong>{props.tippingUser}</strong>?</p>
        <form onSubmit={this.onSubmit}>
          <TextField
            required
            fullWidth
            type="text"
            placeholder="Amount"
            error={!!this.state.submitError}
            helperText={this.state.submitError}
            className={classes.textField}
            inputRef={ref => (this.input = ref)}
          />
          <Grid container justify="flex-end">
            <Grid item>
              <Button variant="contained" color="primary" className={classes.button} type="submit">
                Send Tip
              </Button>
              <Button variant="contained" type="button" className={classes.button} onClick={props.cancel}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TipPrompt));
