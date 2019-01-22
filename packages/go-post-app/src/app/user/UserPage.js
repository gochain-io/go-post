// @flow

import { Grid, Typography, withStyles, CircularProgress } from '@material-ui/core';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  fetchPosts,
  unsubscribeToPosts,
  getPostById,
  startTip,
  closeTipPrompt,
  isPostTippedByUser,
  tip,
  toggleLike,
  isPostLikedByUser,
  makePost
} from './user';
import TipPrompt from './TipPrompt';
import Post from '../../components/Post';
import { userViewToString } from '../../format';
import PostInput from './PostInput';
import MiniwalletPrompt from '../MiniwalletPrompt';
import { saveUsername } from '../profile/profile';
import TopBar from '../TopBar';

const mapStateToProps = state => ({
  mainContract: state.contracts.contracts.main,
  posts: state.user.posts,
  isFetched: state.user.isFetched,
  tippingPostId: state.user.tippingPostId,
  tippingUser: state.user.tippingPostId ?
    userViewToString(getPostById(state.user.posts, state.user.tippingPostId).post.user) :
    null,
  user: state.user.user,
  userAddress: state.user.userAddress,
  isPosting: state.user.isPosting,
  parentAccount: state.contracts.account,
  isMe: state.user.userAddress === state.contracts.account,
});

const mapDispatchToProps = {
  fetchPosts,
  unsubscribeToPosts,
  startTip,
  closeTipPrompt,
  tip,
  toggleLike,
  makePost,
  saveUsername,
};

const styles = theme => ({
  root: {
    paddingTop: 64,
  },
  page: {
    marginTop: theme.spacing.unit * 4,
    [theme.breakpoints.up(450 + theme.spacing.unit * 3 * 2)]: {
      width: 450,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  postsPlaceholder: {
    textAlign: 'center',
  },
  spinner: {
    margin: theme.spacing.unit * 8,
  },
});

class UserPage extends Component {
  componentWillMount() {
    const user = this.props.match.params.user;

    this.props.fetchPosts(user);
  }

  componentWillUnmount() {
    this.props.unsubscribeToPosts();
  }

  render() {
    const props = this.props;
    const classes = props.classes;
    const title = props.isFetched ? props.user : null;

    return (
      <>
        <TopBar title={title} />
        <Grid container justify="center" alignItems="stretch" direction="column" className={classes.page}>
          <MiniwalletPrompt>
            {props.tippingPostId ? (
              <TipPrompt
                tippingPostId={props.tippingPostId}
                tippingUser={props.tippingUser}
                tip={props.tip}
                cancel={props.closeTipPrompt}
              />
            ) : (props.isFetched ? (
              <>
                {props.isMe && (
                  <PostInput makePost={this.props.makePost} isPosting={this.props.isPosting} />
                )}
                {(props.posts && props.posts.length > 0) ? (
                  props.posts.map(post => (
                    <Post
                      key={post.post.id}
                      post={post}
                      likedByMe={isPostLikedByUser(post, props.parentAccount)}
                      tippedByMe={isPostTippedByUser(post, props.parentAccount)}
                      toggleLike={props.toggleLike}
                      startTip={props.startTip}
                    />
                  ))
                ) : (!props.isMe && (
                  <Typography variant="h6" className={classes.postsPlaceholder}>No posts from {this.props.user} yet!</Typography>
                ))}
              </>
            ) : (
              <Grid container justify="center">
                <Grid item>
                  <CircularProgress className={classes.spinner} />
                </Grid>
              </Grid>
            ))}
          </MiniwalletPrompt>
        </Grid>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UserPage));
