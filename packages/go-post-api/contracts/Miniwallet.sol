pragma solidity ^0.4.24;

contract Miniwallet {
    event Deposit(address from, uint amount);
    event Withdraw(address to, uint amount);
    event OwnerAdded(address owner);

    address[] public owners;

    constructor(address[] initialOwners) public payable {
        owners = initialOwners;
    }

    function isOwner(address account) public view returns (bool) {
        for (uint i = 0; i < owners.length; i++) {
            if (owners[i] == account) {
                return true;
            }
        }

        return false;
    }

    modifier onlyOwner {
        require(isOwner(msg.sender), "Sender is not an owner.");
        _;
    }

    function() public payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    function addOwner(address account) public payable onlyOwner {
        if (isOwner(account)) {
            return;
        }

        owners.push(account);
        emit OwnerAdded(account);
    }

    function addOwners(address[] accounts) public onlyOwner {
        for (uint i = 0; i < accounts.length; i++) {
            addOwner(accounts[i]);
        }
    }

    function getOwners() public view returns (address[]) {
        return owners;
    }

    function recharge(address account, uint amountForAccount) public payable onlyOwner {
        require(amountForAccount <= msg.value, "amountForAccount <= msg.value");

        addOwner(account);
        account.transfer(amountForAccount);
    }

    function withdraw(address to, uint amount) public onlyOwner {
        to.transfer(amount);
        emit Withdraw(to, amount);
    }
}
