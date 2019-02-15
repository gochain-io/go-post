import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import RecordVoiceOver from '@material-ui/icons/RecordVoiceOver';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: theme.spacing.unit * 2,
  },
  homeLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
  },
});

const mapStateToProps = state => ({
  network: state.contracts.network,
});

const TopBar = (props) => {
  const { classes } = props;
  const title = props.title || 'Go Post';
  const networkName = (props.network && props.network.name) || null;

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Link to="/" className={classes.homeLink}>
            <RecordVoiceOver className={classes.icon} />
            <Typography variant="h6" color="inherit">
              {title}
            </Typography>
          </Link>
          {networkName && (
            <Typography variant="subtitle1" color="inherit">
              {networkName}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default withStyles(styles)(connect(mapStateToProps)(TopBar));
