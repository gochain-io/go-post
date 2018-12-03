import React from 'react';
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
  icon: {
    marginRight: theme.spacing.unit * 2,
  },
  homeLink: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
  }
});

const TopBar = (props) => {
  const { classes } = props;
  const title = props.title || 'Go Post';

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Link to="/" className={classes.homeLink}>
            <RecordVoiceOver className={classes.icon} />
            <Typography variant="h6" color="inherit">
              {title}
            </Typography>
          </Link>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default withStyles(styles)(TopBar);
