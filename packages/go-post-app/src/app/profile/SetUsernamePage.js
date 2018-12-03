import BN from 'bn.js';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Avatar, Button, Grid, Paper, TextField, Typography, withStyles } from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import { saveUsername, setDidSetUsername } from './profile';
import MiniwalletPrompt from '../MiniwalletPrompt';
import BlockTimeIndicator from '../../components/BlockTimeIndicator';
import TopBar from '../TopBar';

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
  button: {
    marginTop: theme.spacing.unit * 2,
  },
  timeIndicator: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  }
});

const mapStateToProps = state => ({
  didSetUsername: state.profile.didSetUsername,
  username: state.profile.username,
  isSaving: state.profile.isSaving,
});

const mapDispatchToProps = {
  saveUsername,
  setDidSetUsername,
};

class SetUsernamePage extends Component {
  onSubmit = event => {
    event.preventDefault();
    const { value } = this.input;
    const trimmed = value.trim()
    if (!trimmed) {
      return;
    }

    if (trimmed.length < 4 || trimmed.length > 15) {
      alert('Username must be between 4 and 15 characters long.'); // TODO: Show error properly.
      return;
    }

    this.input.value = '';
    this.props.saveUsername(trimmed);
  };

  componentWillMount() {
    this.props.setDidSetUsername(false);
  }

  componentDidMount() {
    this.input.focus();
  }

  render() {
    const { props } = this;
    const { classes } = props;

    return (props.didSetUsername ? (
      <Redirect to={`/users/${props.username}`} />
    ) : (
      <>
        <TopBar />
        <Grid container justify="center" alignItems="stretch" direction="column" className={classes.page}>
          <MiniwalletPrompt>
            <Paper className={classes.paper}>
              <Avatar className={classes.avatar}>
                <Person />
              </Avatar>
              <Typography component="h1" variant="h5" className={classes.title}>
                Set Your Username
              </Typography>
              <form onSubmit={this.onSubmit}>
                <TextField
                  required
                  fullWidth
                  type="text"
                  placeholder="Username"
                  className={classes.textField}
                  inputRef={ref => (this.input = ref)}
                />
                <Grid container justify="center">
                  <Grid item>
                    <Button variant="contained" color="primary" type="submit" className={classes.button} disabled={props.isSaving}>
                      {props.isSaving ? (
                        <BlockTimeIndicator className={classes.timeIndicator} size={20} />
                      ) : 'Save'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </MiniwalletPrompt>
        </Grid>
      </>
    ));
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SetUsernamePage));
