// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchPosts } from './user';

const mapStateToProps = state => ({
  mainContract: state.contracts.contracts.main,
  posts: state.user.posts,
  isFetched: state.user.isFetched
});

const mapDispatchToProps = {
  fetchPosts,
};

class UserPage extends Component {
  async componentWillMount() {
    const username = this.props.match.params.username;

    this.props.fetchPosts(username);
  }

  render() {
    const props = this.props;

    return (
      <div>
        <p>UserPage {props.networkId}</p>
        {props.isFetched && !!props.posts && props.posts.map(post => (
          <p key={post.id}>{post.content}</p>
        ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);
