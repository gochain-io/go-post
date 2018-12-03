import BN from 'bn.js';
import React, { Component } from 'react';
import { Button, Grid, Paper, TextField, Typography, withStyles } from '@material-ui/core';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 5,
  },
  textField: {
    // marginTop: theme.spacing.unit * 5,
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    marginRight: theme.spacing.unit * 2,
  },
});

const minimumTip = 0.1;

class TipPrompt extends Component {
  onSubmit = event => {
    event.preventDefault();
    const { value } = this.input;
    const trimmed = value.trim()
    if (!trimmed) {
      return;
    }

    let num = Number(trimmed);
    if (num < minimumTip) {
      return; // TODO: Show error.
    }
    // Exponent here plus exponent below MUST equal 18. e.g. 4 + 14 = 18.
    // We do this because BN doesn't support decimals.
    num = Math.floor(num * 1e4);
    const bigNum = new BN(10).pow(new BN(14)).mul(new BN(num));

    // TODO: Handle not having enough GO.

    this.props.tip(this.props.tippingPostId, bigNum);
    this.input.value = '';
  };

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

export default withStyles(styles)(TipPrompt);
