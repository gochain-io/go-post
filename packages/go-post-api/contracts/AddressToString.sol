pragma solidity ^0.4.24;

library AddressToString {
    function toAsciiString(address self) public pure returns (string) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(self) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2*i] = byte(hi);
            s[2*i+1] = byte(lo);
        }
        return string(s);
    }
}
