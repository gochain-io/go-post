import { Form, Text } from 'informed';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { makePost } from './user/user';

const mapStateToProps = state => ({
  mainContract: state.contracts.contracts.main
});

const mapDispatchToProps = {
  makePost
};

class NewPostPage extends Component {
  setFormApi = (formApi) => {
    this.formApi = formApi;
  };

  submit = () => {
    const content = this.formApi.getValue('content');
    this.props.makePost(content);
  };

  render() {
    const props = this.props;

    return (
      <Form getApi={this.setFormApi}>
        <Text field="content" />
        <button type="button" onClick={this.submit}>Submit</button>
      </Form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewPostPage);
