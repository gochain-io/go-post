pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

contract MainContract {
    event NewPost(address user, Post post);

    event UsernameInUse(address by);
    event UsernameSet(address user, string username);
    event UsernameUnset(address user, string username);

    struct Post {
        uint id;
        address user;
        uint time;
        string content;
    }

    uint nextPostId = 0;
    mapping(uint => Post) public postById;

    mapping(address => uint[]) public postIdsByUser;

    uint public usernameMinLength = 4;
    uint public usernameMaxLength = 15;
    mapping(address => string) public usernameByUser;
    // Uses explicit getter due to Solidity limitations.
    mapping(string => address) internal userByUsername;

    constructor() public {
    }

    function makePost(string _content) public {
        address user = msg.sender;
        uint id = makePostId();
        Post memory post = Post({
            id: id,
            user: user,
            /*solium-disable-next-line security/no-block-members*/
            time: block.timestamp,
            content: _content
        });

        postById[id] = post;
        postIdsByUser[user].push(id);
        emit NewPost(user, post);
    }

    function getPostIdsByUser(address user) public view returns (uint[]) {
        return postIdsByUser[user];
    }

    function getPostsByUser(address user) public view returns (Post[]) {
        uint[] memory postIds = postIdsByUser[user];
        Post[] memory posts = new Post[](postIds.length);

        for (uint i = 0; i < postIds.length; i++) {
            uint id = postIds[i];
            posts[i] = postById[id];
        }

        return posts;
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

    function setUsername(string username) public {
        require(isValidUsername(username), "Invalid username.");

        address user = msg.sender;
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

    function unsetUsername() public {
        unsetUserUsername(msg.sender);
    }

    function getUserByUsername(string username) public view returns (address) {
        return userByUsername[username];
    }
}
