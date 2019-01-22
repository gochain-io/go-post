import classnames from 'classnames';
import React, { Component, } from 'react';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CardGiftcard from '@material-ui/icons/CardGiftcard'
import Web3 from 'web3';

import { formatUser, formatTimestamp, userViewToString } from '../format';
import BlockTimeIndicator from './BlockTimeIndicator';

const styles = theme => ({
  card: {
    marginBottom: theme.spacing.unit * 2,
  },
  actions: {
    display: 'flex',
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
  link: {
    textDecoration: 'none',
    ...theme.typography.body2,
  },
  timeIndicator: {
    margin: 12,
  },
  activatedIcon: {
    color: theme.palette.primary.main,
  },
});

const firstLetter = (user) => {
  if (!Web3.utils.isAddress(user)) {
    return user.substring(0, 1).toUpperCase();
  }

  return '';
};

class Post extends Component {
  toggleLike = () => {
    this.props.toggleLike(this.props.post.post.id);
  };

  startTip = async () => {
    this.props.startTip(this.props.post.post.id);
  }

  render() {
    const {
      classes,
      post: { post, likePending, tipPending },
      likedByMe,
      tippedByMe,
    } = this.props;

    const user = userViewToString(post.user);

    return (
      <Card className={classes.card}>
        <CardHeader
          avatar={
            <Avatar className={classes.avatar}>
              {firstLetter(user)}
            </Avatar>
          }
          title={(
            <Link to={`/users/${user}`} className={classes.link}>
              {formatUser(user)}
            </Link>
          )}
          subheader={formatTimestamp(post.time)}
        />
        <CardContent>
          {post.content.split('\n').map((item, i) => (
            <Typography component="p" key={i}>
              {item}
            </Typography>
          ))}
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>
          {likePending ? (
            <BlockTimeIndicator className={classes.timeIndicator} size={24} />
          ) : (
            <IconButton
              className={classnames({
                [classes.activatedIcon]: likedByMe,
              })}
              onClick={this.toggleLike}
            >
              <FavoriteIcon />
            </IconButton>
          )}
          {tipPending ? (
            <BlockTimeIndicator className={classes.timeIndicator} size={24} />
          ) : (
            <IconButton
              className={classnames({
                [classes.activatedIcon]: tippedByMe,
              })}
              onClick={this.startTip}
            >
              <CardGiftcard />
            </IconButton>
          )}
        </CardActions>
      </Card>
    );
  }
}

export default withStyles(styles)(Post);
