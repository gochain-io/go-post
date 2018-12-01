#!/usr/bin/env bash

set -o errexit

# Executes clean_up function at exit.
trap clean_up EXIT

clean_up() {
  if [ -n "$testrpc_pid" ] && ps -p $testrpc_pid > /dev/null; then
    kill -9 $testrpc_pid
  fi
}

testrpc_running() {
  nc -z localhost 8545
}

start_testrpc() {
  local accounts=(
    --account="0x0000000000000000000000000000000000000000000000000000000000000001,1000000000000000000000000"
    --account="0x0000000000000000000000000000000000000000000000000000000000000002,1000000000000000000000000"
    --account="0x0000000000000000000000000000000000000000000000000000000000000003,1000000000000000000000000"
    --account="0x0000000000000000000000000000000000000000000000000000000000000004,1000000000000000000000000"
    --account="0x0000000000000000000000000000000000000000000000000000000000000005,1000000000000000000000000"
  )

  node_modules/.bin/ganache-cli --gasLimit 136500000 -a "${accounts[@]}" > /dev/null &

  testrpc_pid=$!
}

if testrpc_running; then
  echo "Using existing testrpc instance."
else
  echo "Starting testrpc."
  start_testrpc
fi

node_modules/.bin/truffle test
