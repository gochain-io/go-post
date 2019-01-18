pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import {AddressToString} from "./AddressToString.sol";
import {Miniwallet} from "./Miniwallet.sol";

contract MainContract {
    using AddressToString for address;

    event NewMiniwallet(address user, address wallet);

    event NewPost(address user, PostView post);

    event UsernameInUse(address by);
    event UsernameSet(address user, string username);
    event UsernameUnset(address user, string username);

    event PostLiked(address liker, uint postId);
    event PostUnliked(address liker, uint postId);

    event PostTipped(address fromUser, address toUser, uint forPost, uint amount);

    mapping(address => address) public miniwalletByUser;

    struct UserView {
        address addr;
        string username;
    }

    struct Post {
        uint id;
        address user;
        uint time;
        string ipfsPath;
    }

    struct PostView {
        uint id;
        UserView user;
        uint time;
        string ipfsPath;
        UserView[] likes;
        TipView[] tips;
    }

    uint nextPostId = 1;
    mapping(uint => Post) public postById;

    mapping(address => uint[]) public postIdsByUser;

    uint public usernameMinLength = 4;
    uint public usernameMaxLength = 15;
    mapping(address => string) public usernameByUser;
    // Uses explicit getter due to Solidity limitations.
    mapping(string => address) internal userByUsername;

    mapping(uint => address[]) public likesByPostId;
    mapping(address => uint[]) public likesByUser;

    mapping(uint => Tip[]) public tipsByPostId;
    mapping(address => Tip[]) public tipsByUser;

    struct Tip {
        address fromUser;
        address toUser;
        uint forPost;
        uint amount;
    }

    struct TipView {
        UserView fromUser;
        UserView toUser;
        uint forPost;
        uint amount;
    }

    constructor() public {}

    function makeMiniwallet() public payable {
        address user = msg.sender;

        address[] memory owners = new address[](1);
        owners[0] = user;

        Miniwallet wallet = new Miniwallet(owners);
        miniwalletByUser[user] = wallet;
        emit NewMiniwallet(user, wallet);
    }

    function senderControlsUser(address user) public view returns (bool) {
        if (user == msg.sender) {
            return true;
        }

        address walletAddress = miniwalletByUser[user];
        if (walletAddress == address(0)) {
            return false;
        }

        return Miniwallet(walletAddress).isOwner(msg.sender);
    }

    modifier onlyController(address user)  {
        require(senderControlsUser(user), "Sender does not control this user.");
        _;
    }

    function getPostLikes(uint postId) public view returns (UserView[]) {
        address[] memory addresses = likesByPostId[postId];
        UserView[] memory likes = new UserView[](addresses.length);

        for (uint i = 0; i < addresses.length; i++) {
            likes[i] = getUserView(addresses[i]);
        }

        return likes;
    }

    function getPostTips(uint postId) public view returns (TipView[]) {
        Tip[] memory tips = tipsByPostId[postId];
        TipView[] memory tipViews = new TipView[](tips.length);

        for (uint i = 0; i < tips.length; i++) {
            tipViews[i] = tipToTipView(tips[i]);
        }

        return tipViews;
    }

    function postToPostView(Post post, bool isNew) public view returns (PostView) {
        UserView[] memory likes;
        TipView[] memory tips;

        if (!isNew) {
            likes = getPostLikes(post.id);
            tips = getPostTips(post.id);
        }

        return PostView({
            id: post.id,
            user: getUserView(post.user),
            time: post.time,
            ipfsPath: post.ipfsPath,
            likes: likes,
            tips: tips
        });
    }

    function makePost(address user, string _ipfsPath) public onlyController(user) {
        uint id = makePostId();
        Post memory post = Post({
            id: id,
            user: user,
            /*solium-disable-next-line security/no-block-members*/
            time: block.timestamp,
            ipfsPath: _ipfsPath
        });

        postById[id] = post;
        postIdsByUser[user].push(id);
        emit NewPost(user, postToPostView(post, true));
    }

    function getPostsFromIds(uint[] postIds) public view returns (PostView[]) {
        PostView[] memory posts = new PostView[](postIds.length);

        for (uint i = 0; i < postIds.length; i++) {
            uint id = postIds[i];
            posts[i] = postToPostView(postById[id], false);
        }

        return posts;
    }

    function getPostIdsByUser(address user) public view returns (uint[]) {
        return postIdsByUser[user];
    }

    function getPostsByUser(address user) public view returns (PostView[]) {
        return getPostsFromIds(postIdsByUser[user]);
    }

    function makePostId() public returns (uint) {
        uint next = nextPostId;
        nextPostId += 1;
        return next;
    }

    function isValidUsername(string username) public view returns (bool) {
        bytes memory b = bytes(username);
        uint length = b.length;

        if (length < usernameMinLength || length > usernameMaxLength) {
            return false;
        }

        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];

            // Numbers, lower-case letters and underscores
            if (!(char >= 0x30 && char <= 0x39) && !(char >= 0x61 && char <= 0x7A) && !(char == 0x5F)) {
                return false;
            }
        }

        return true;
    }

    function unsetUserUsername(address user) internal {
        string memory username = usernameByUser[user];

        if (bytes(username).length > 0) {
            delete usernameByUser[user];
            delete userByUsername[username];
            emit UsernameUnset(user, username);
        }
    }

    function setUsername(address user, string username) public onlyController(user) {
        require(isValidUsername(username), "Invalid username.");

        address currentOwner = userByUsername[username];

        if (currentOwner != address(0) && currentOwner != user) {
            emit UsernameInUse(currentOwner);
            return;
        }

        unsetUserUsername(user);
        usernameByUser[user] = username;
        userByUsername[username] = user;
        emit UsernameSet(user, username);
    }

    function unsetUsername(address user) public onlyController(user) {
        unsetUserUsername(user);
    }

    function getUserByUsername(string username) public view returns (address) {
        return userByUsername[username];
    }

    function getUserView(address user) public view returns (UserView) {
        return UserView({
            addr: user,
            username: usernameByUser[user]
        });
    }

    function getUsersFromAddresses(address[] addresses) public view returns (UserView[]) {
        UserView[] memory users = new UserView[](addresses.length);

        for (uint i = 0; i < addresses.length; i++) {
            users[i] = getUserView(addresses[i]);
        }

        return users;
    }

    function likePost(address user, uint postId) public onlyController(user) {
        require(postById[postId].id != 0, "Post does not exist.");

        uint[] memory likedPosts = likesByUser[user];

        for (uint i = 0; i < likedPosts.length; i++) {
            if (likedPosts[i] == postId) {
                return;
            }
        }

        likesByUser[user].push(postId);
        likesByPostId[postId].push(user);
        emit PostLiked(user, postId);
    }

    function unlikePost(address user, uint postId) public onlyController(user) {
        require(postById[postId].id != 0, "Post does not exist.");

        address[] memory postLikes = likesByPostId[postId];

        for (uint i = 0; i < postLikes.length; i++) {
            if (postLikes[i] == user) {
                likesByPostId[postId][i] = postLikes[postLikes.length - 1];
                delete likesByPostId[postId][postLikes.length - 1];
                likesByPostId[postId].length--;
                break;
            }
        }

        uint[] memory likedPosts = likesByUser[user];

        for (uint j = 0; j < likedPosts.length; j++) {
            if (likedPosts[j] == postId) {
                likesByUser[user][j] = likedPosts[likedPosts.length - 1];
                delete likesByUser[user][likedPosts.length - 1];
                likesByUser[user].length--;
                break;
            }
        }

        emit PostUnliked(user, postId);
    }

    function getLikesByPostId(uint postId) public view returns (address[]) {
        return likesByPostId[postId];
    }

    function getLikesByUser(address user) public view returns (uint[]) {
        return likesByUser[user];
    }

    uint public tipMinimumAmount = 0.1 ether;

    function tipPost(address fromUser, uint postId) public payable onlyController(fromUser) {
        Post memory post = postById[postId];
        require(post.id != 0, "Post does not exist.");

        address toUser = post.user;

        require(msg.value >= tipMinimumAmount, "Tip amount too small.");

        Tip memory tip = Tip({
            fromUser: fromUser,
            toUser: toUser,
            forPost: postId,
            amount: msg.value
        });

        tipsByPostId[postId].push(tip);
        tipsByUser[fromUser].push(tip);

        toUser.transfer(msg.value);

        emit PostTipped(fromUser, toUser, postId, msg.value);
    }

    function tipToTipView(Tip tip) public view returns (TipView) {
        return TipView({
            fromUser: getUserView(tip.fromUser),
            toUser: getUserView(tip.toUser),
            forPost: tip.forPost,
            amount: tip.amount
        });
    }

    function getTipsByPostId(uint postId) public view returns (Tip[]) {
        return tipsByPostId[postId];
    }

    function getTipsByUser(address user) public view returns (Tip[]) {
        return tipsByUser[user];
    }
}
