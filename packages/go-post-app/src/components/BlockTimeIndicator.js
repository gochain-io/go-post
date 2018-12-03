import CircularProgress from '@material-ui/core/CircularProgress';
import React, { Component } from 'react';
import { connect } from 'react-redux';

// GoChain's predictable block time.
// TODO: In case the block time is reduced in the future, we could measure it instead (e.g. take the last inter-block duration).
const blockSpacing = 5;

const mapStateToProps = state => ({
  lastBlockTime: state.contracts.lastBlockTime,
});

class BlockTimeIndicator extends Component {
  static defaultProps = {
    size: 20,
  };

  state = {
    time: new Date(),
  };

  componentDidMount() {
    this.timer = setInterval(this.progress, 250);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  progress = () => {
    this.setState({ time: new Date() });
  };

  render() {
    const props = this.props;
    const timeElapsed = (this.state.time - props.lastBlockTime) / 1000;
    let progress = (timeElapsed / blockSpacing);
    progress = Math.min(Math.max(progress, 0), 1) * 100;

    return <CircularProgress className={props.className} variant="static" size={props.size} thickness={5} value={progress} />;
  }
}

export default connect(mapStateToProps)(BlockTimeIndicator);
