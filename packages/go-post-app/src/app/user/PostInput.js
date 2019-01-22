import React from 'react';
import { Paper, TextField, Button, Grid, withStyles } from '@material-ui/core';
import BlockTimeIndicator from '../../components/BlockTimeIndicator';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  button: {
    marginTop: theme.spacing.unit,
  },
  timeIndicator: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  }
});

class PostInput extends React.Component {
  onSubmit = event => {
    event.preventDefault();
    const { value } = this.input;
    if (!value.trim()) {
      return;
    }

    this.props.makePost(value);
    this.input.value = '';
  };

  componentDidMount() {
    this.input.focus();
  }

  render() {
    const { classes, isPosting } = this.props;

    return (
      <Paper className={classes.paper}>
        <form onSubmit={this.onSubmit}>
          <TextField
            required
            fullWidth
            multiline
            rows={2}
            placeholder="What's on your mind?"
            inputRef={input => { this.input = input; }}
          />
          <Grid container justify="flex-end">
            <Grid item>
              <Button variant="outlined" color="primary" type="submit" className={classes.button} disabled={isPosting}>
                {isPosting ? (
                  <BlockTimeIndicator className={classes.timeIndicator} size={20} />
                ) : 'Post'}
              </Button>

            </Grid>
          </Grid>
        </form>
      </Paper>
    );
  }
}

export default withStyles(styles)(PostInput);
