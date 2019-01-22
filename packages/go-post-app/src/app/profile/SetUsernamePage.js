import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { Button, Grid, TextField, withStyles } from '@material-ui/core';
import Person from '@material-ui/icons/Person';
import { saveUsername, setDidSetUsername } from './profile';
import MiniwalletPrompt from '../MiniwalletPrompt';
import BlockTimeIndicator from '../../components/BlockTimeIndicator';
import TopBar from '../TopBar';

import SimplePrompt from '../../components/SimplePrompt';

const styles = theme => ({
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
  state = {
    submitError: null,
  };

  onSubmit = event => {
    event.preventDefault();
    const { value } = this.input;
    const trimmed = value.trim()
    if (!trimmed) {
      return;
    }

    if (trimmed.length < 4 || trimmed.length > 15) {
      this.setState({ submitError: 'Username must be between 4 and 15 characters long.' });
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
            <SimplePrompt avatar={<Person />} title='Set Your Username'>
              <form onSubmit={this.onSubmit}>
                <TextField
                  required
                  fullWidth
                  type="text"
                  placeholder="Username"
                  error={!!this.state.submitError}
                  helperText={this.state.submitError}
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
            </SimplePrompt>
          </MiniwalletPrompt>
        </Grid>
      </>
    ));
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SetUsernamePage));
