import React, { Component } from 'react';
import { Avatar, Grid, Paper, Typography, withStyles } from '@material-ui/core';

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
});

class SimplePrompt extends Component {
  render() {
    const { props } = this;
    const { classes } = props;

    return (
      <Grid container justify="center" alignItems="stretch" direction="column" className={classes.page}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            {props.avatar}
          </Avatar>
          <Typography component="h1" variant="h5" className={classes.title}>
            {props.title}
          </Typography>
          {props.children}
        </Paper>
      </Grid>
    );
  }
}

export default withStyles(styles)(SimplePrompt);
