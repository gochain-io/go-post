import React, { Component } from 'react';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  lastBlockTime: state.contracts.lastBlockTime,
});

const BlockTimeIndicator = props => {
  return <p>Test</p>;
};

export default connect(mapStateToProps)(BlockTimeIndicator);
