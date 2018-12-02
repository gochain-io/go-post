// @flow

import BN from 'bn.js';
import { Form, Text } from 'informed';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { makePost } from './user/user';
import { recharge, sendTransaction } from '../redux/miniwallet';

const mapStateToProps = state => ({
  mainContract: state.contracts.contracts.main,
  miniwallet: state.miniwallet.contract,
  web3: state.contracts.web3,
  parentAccount: state.contracts.account,
  account: state.contracts.account,
});

const mapDispatchToProps = {
  makePost,
  recharge,
  sendTransaction,
};

class NewPostPage extends Component {
  setFormApi = (formApi) => {
    this.formApi = formApi;
  };

  submit = async () => {
    // await this.props.web3.eth.sendTransaction({
    //   from: this.props.parentAccount,
    //   to: this.props.miniwallet.options.address,
    //   value: new BN(10).pow(new BN(18))
    // })

    const content = this.formApi.getValue('content');
    await this.props.makePost(content);
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
