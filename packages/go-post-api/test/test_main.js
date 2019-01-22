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
      await instance.methods.makePost(accounts[0], 'Test message').send({ from: accounts[0], gas: 1e7 });
      const userPosts = await instance.methods.getPostIdsByUser(accounts[0]).call();
      assert.deepEqual(userPosts, ['1']);
      const post = await instance.methods.postById(userPosts[0]).call();
      assert.equal(post.ipfsPath, 'Test message');
    });

    it('should increment post IDs', async () => {
      for (let i = 0; i < 2; i++) {
        await instance.methods.makePost(accounts[0], 'Test').send({ from: accounts[0], gas: 1e7 });
      }

      const userPosts = await instance.methods.getPostIdsByUser(accounts[0]).call();
      assert.deepEqual(userPosts, ['1', '2']);
    });
  });

  describe('usernames', () => {
    it('should claim username', async () => {
      const setResult = await instance.methods.setUsername(accounts[0], 'test_user').send({ from: accounts[0] });
      assert(setResult.events.hasOwnProperty('UsernameSet'));
      const username = await instance.methods.usernameByUser(accounts[0]).call();
      assert.equal(username, 'test_user');
      const user = await instance.methods.getUserByUsername('test_user').call();
      assert.equal(user.toLowerCase(), accounts[0].toLowerCase());
    });

    it('should prevent conflicts', async () => {
      await instance.methods.setUsername(accounts[0], 'test_user').send({ from: accounts[0] });
      const result = await instance.methods.setUsername(accounts[1], 'test_user').send({ from: accounts[1] });
      assert(result.events.hasOwnProperty('UsernameInUse'), 'UsernameInUse event');
      const user = await instance.methods.getUserByUsername('test_user').call();
      assert.equal(user.toLowerCase(), accounts[0].toLowerCase());
    });

    it('should change correctly', async () => {
      await instance.methods.setUsername(accounts[0], 'test_user1').send({ from: accounts[0] });
      await instance.methods.setUsername(accounts[0], 'test_user2').send({ from: accounts[0] });
      const user1 = await instance.methods.getUserByUsername('test_user1').call();
      const user2 = await instance.methods.getUserByUsername('test_user2').call();
      const username = await instance.methods.usernameByUser(accounts[0]).call();
      assert(web3.utils.toBN(user1).eq(new BN(0)), 'user1 is zero address');
      assert.equal(user2.toLowerCase(), accounts[0].toLowerCase());
      assert.equal(username, 'test_user2');
    });

    it('should reject invalid usernames', async () => {
      try {
        await instance.methods.setUsername(accounts[0], 'CAPITAL').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }

      try {
        await instance.methods.setUsername(accounts[0], 'ab').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }

      try {
        await instance.methods.setUsername(accounts[0], 'abcdefghijklmnopqrstuvwxyz').send({ from: accounts[0] });
        throw new Error();
      } catch (err) {
        assert(err.message.toLowerCase().includes('invalid username'));
      }
    });
  });

  describe('likes', () => {
    let poster = null;
    let postId = null;

    beforeEach(async () => {
      poster = accounts[0];
      const postResult = await instance.methods.makePost(poster, 'Test').send({ from: poster, gas: 1e7 });
      postId = postResult.events.NewPost.returnValues.post.id;
    });

    it('should like post', async () => {
      await instance.methods.setUsername(accounts[1], 'test').send({ from: accounts[1], gas: 1e7 });
      const result = await instance.methods.likePost(accounts[1], postId).send({ from: accounts[1], gas: 1e7 });
      const event = result.events.PostLiked;
      assert.exists(event);

      const userLikes = await instance.methods.getLikesByUser(accounts[1]).call();
      assert.deepEqual(userLikes, [postId], 'getLikesByUser');
    });

    it('should unlike post', async () => {
      await instance.methods.setUsername(accounts[1], 'test').send({ from: accounts[1], gas: 1e7 });
      await instance.methods.likePost(accounts[1], postId).send({ from: accounts[1], gas: 1e7 });
      const result = await instance.methods.unlikePost(accounts[1], postId).send({ from: accounts[1], gas: 1e7 });
      const event = result.events.PostUnliked;
      assert.exists(event);

      const userLikes = await instance.methods.getLikesByUser(accounts[1]).call();
      assert.deepEqual(userLikes, [], 'getLikesByUser');
    });
  });

  describe('tips', () => {
    let poster = null;
    let postId = null;

    beforeEach(async () => {
      poster = accounts[0];
      const postResult = await instance.methods.makePost(poster, 'Test').send({ from: poster, gas: 1e7 });
      postId = postResult.events.NewPost.returnValues.post.id;
    });

    it('should tip post', async () => {
      await instance.methods.setUsername(accounts[1], 'test').send({ from: accounts[1], gas: 1e7 });
      const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

      const tipAmount = new BN('10').pow(new BN('17'));
      const result = await instance.methods.tipPost(accounts[1], postId).send({ value: tipAmount, from: accounts[1], gas: 1e7 });
      const event = result.events.PostTipped;
      assert.exists(event);

      const values = event.returnValues;
      assert.equal(values.fromUser.toLowerCase(), accounts[1].toLowerCase());
      assert.equal(values.toUser.toLowerCase(), accounts[0].toLowerCase());
      assert.equal(values.forPost, postId);

      const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
      const balanceChange = balanceAfter.sub(balanceBefore);
      assert(web3.utils.toBN(event.returnValues.amount).eq(tipAmount), 'PostTipped event has correct amount.');
      assert(balanceChange.eq(tipAmount), 'Tip amount was added to poster.');
    });
  });
});
