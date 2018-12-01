const MainContract = artifacts.require('./MainContract.sol');

const BN = require('bn.js');
const { getWeb3 } = require('./helpers');

const web3 = getWeb3();

contract('MainContract', accounts => {
  let instance;
  let owner;

  beforeEach(async () => {
    owner = accounts[0];

    const contractTemplate = new web3.eth.Contract(MainContract.abi);
    instance = await (contractTemplate.deploy({
      data: MainContract.binary
    }).send({
      from: owner,
      gas: 1e7
    }));
  });

  describe('posting', () => {
    it('should make basic post', async () => {
      await instance.methods.makePost('Test message').send({ from: accounts[0], gas: 1e7 });
      const userPosts = await instance.methods.getPostIdsByUser(accounts[0]).call();
      assert.deepEqual(userPosts, ['0']);
      const post = await instance.methods.postById(userPosts[0]).call();
      assert.equal(post.content, 'Test message');
    });

    it('should increment post IDs', async () => {
      for (let i = 0; i < 2; i++) {
        await instance.methods.makePost('Test').send({ from: accounts[0], gas: 1e7 });
      }

      const userPosts = await instance.methods.getPostIdsByUser(accounts[0]).call();
      assert.deepEqual(userPosts, ['0', '1']);
    });
  });

  describe('usernames', () => {
    it('should claim username', async () => {
      const setResult = await instance.methods.setUsername('test_user').send({ from: accounts[0] });
      assert(setResult.events.hasOwnProperty('UsernameSet'));
      const username = await instance.methods.usernameByUser(accounts[0]).call();
      assert.equal(username, 'test_user');
      const user = await instance.methods.getUserByUsername('test_user').call();
      assert.equal(user.toLowerCase(), accounts[0].toLowerCase());
    });

    it('should prevent conflicts', async () => {
      await instance.methods.setUsername('test_user').send({ from: accounts[0] });
      const result = await instance.methods.setUsername('test_user').send({ from: accounts[1] });
      assert(result.events.hasOwnProperty('UsernameInUse'), 'UsernameInUse event');
      const user = await instance.methods.getUserByUsername('test_user').call();
      assert.equal(user.toLowerCase(), accounts[0].toLowerCase());
    });

    it('should change correctly', async () => {
      await instance.methods.setUsername('test_user1').send({ from: accounts[0] });
      await instance.methods.setUsername('test_user2').send({ from: accounts[0] });
      const user1 = await instance.methods.getUserByUsername('test_user1').call();
      const user2 = await instance.methods.getUserByUsername('test_user2').call();
      const username = await instance.methods.usernameByUser(accounts[0]).call();
      assert(web3.utils.toBN(user1).eq(new BN(0)), 'user1 is zero address');
      assert.equal(user2.toLowerCase(), accounts[0].toLowerCase());
      assert.equal(username, 'test_user2');
    });

    it('should reject invalid usernames', async () => {
      try {
        await instance.methods.setUsername('CAPITAL').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }

      try {
        await instance.methods.setUsername('ab').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }

      try {
        await instance.methods.setUsername('abcdefghijklmnopqrstuvwxyz').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }
    });
  });
});
