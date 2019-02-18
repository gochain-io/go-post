# Go Post

Go Post is an example project showing how to make a decentralized application on [GoChain](https://gochain.io/). Similar to Twitter, it allows users to post and like messages. Unlike Twitter, users can tip each other for posts by sending GO.

Go Post also demonstrates a new method to make decentralized applications more convenient by not requiring every user action to be signed using MetaMask. See [Miniwallet](#Miniwallet) below.

## Packages

Go Post includes two packages: go-post-app and go-post-api. go-post-app is a user-facing React-Redux application. It interacts via [Web3](https://github.com/ethereum/web3.js/) with go-post-api, which is a set of smart contracts on GoChain.

go-post-app stores and retrieves message content using IPFS, while everything else goes on GoChain.

## Before Getting Started
During development MetaMask **must be disabled (or not installed)** in your browser or go-post-app will attempt to find the smart contracts on whichever GoChain network your MetaMask is connected to. With MetaMask disabled, go-post-app uses your local GoChain instance.

In either case go-post-app finds the smart contract addresses for the corresponding network by reading go-post-api's artifact files.

## Setup

```sh
$ git clone https://github.com/go-chain/go-post
$ cd go-post
$ npm install
$ npm run bootstrap
```

This will install the dependencies of both projects.

## Developing and running locally

In terminal 1:

```sh
# Start a local GoChain instance (this runs in the background)
$ docker run --name local_node -p 8545:8545 -p 8546:8546 -d gochain/gochain gochain --local --rpccorsdomain "*"
```
You will need to wait until your local node is fully running.  It may also be helpful to check the docker logs to see the accounts that are being created and pre-funded.  You will need one of the account keys to set before running the migration in the next step.

```sh
docker logs local_node
```
Once you see blocks being mined and the funded accounts you are ready to proceed.

```sh
# Deploy contracts
$ cd packages/go-post-api
$ npm run migrate:local
# Configure node IP if not localhost:
# LOCAL_NODE_IP=192.168.99.100 npm run migrate:local
```

In addition to the local GoChain node and deployed contracts, the app needs an [IPFS daemon](https://docs.ipfs.io/introduction/install/) to store posts on. By default it looks for one at http://localhost:5001 but this is configurable as shown below. In terminal 2:

```sh
# In another terminal, navigate to go-post-app and run it.
$ cd packages/go-post-app
$ npm run start

# Optional configuration:
# REACT_APP_IPFS_HOST=... REACT_APP_IPFS_PORT=... REACT_APP_LOCAL_NODE_IP=192.168.99.100 npm run start
```

go-post-api has a test suite that can be run with `npm run test` from `packages/go-post-api`.

## Building a production version

To run the application on the GoChain test network or main network, first deploy the smart contracts.

```sh
cd packages/go-post-api
# Deploy to the GoChain test network.
WEB3_PRIVATE_KEY=... npm run migrate:test
# Deploy to the GoChain main network.
WEB3_PRIVATE_KEY=... npm run migrate:main
```

`WEB3_PRIVATE_KEY` must be set to the private key of an account that has sufficient funds on the network you're deploying to.

Then create a production build of go-post-app.

```sh
cd packages/go-post-app
npm run build
```

This build can connect to different networks (test network, main network) depending on what you select in MetaMask.

## Miniwallet

Essentially all decentralized applications on Ethereum-like networks either require all of a user's actions to be signed with MetaMask or require the user to load a private key into a web page. They are therefore either cumbersome to use, or insecure.

Go Post uses a unique method to make signing unnecessary for most of its transactions while also putting a small cap on the damage that an attacker can cause by hacking the website.

### How it works

In short, the Miniwallet works by loading a small amount of funds into an account that, unlike MetaMask, the web page has control over. We call this a "child account" (in relation to the MetaMask "parent account"). The private key is stored in local storage. While this idea sort of works, a few important subtleties require us to make some changes.

We want the child account to store enough funds to execute a moderate to large number of transactions. But we also want it to be small enough that the user doesn't mind the risk of funding it. Since GoChain transactions are cheap we can meet both these guarantees.

But since the page stores the private key for the child account in local storage, any time the user clears their browser data or goes to another browser or device they will have to load a new child account with more funds. If the user clears their data often, these small costs can add up.

To solve this problem we instead load a small amount of funds into a smart contract (the "miniwallet") and only give the child account enough for a few transactions. The miniwallet lists the child account as one of its "owners", allowing that account to recharge _itself_. The miniwallet also lists the user's MetaMask account as an owner so that when they lose access to the child account they can still reactivate the miniwallet with a MetaMask transaction and reclaim the majority of deposited funds.

When the miniwallet itself runs out another MetaMask transaction is needed to recharge it.

