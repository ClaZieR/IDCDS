// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract IDCDS is ERC721, Ownable {
    uint256 public mintPrice;
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isPublicMintEnabled;
    string internal baseTokenURI;
    uint public maxPerWallet;
    address payable public withdrawWallet;
    mapping (address => uint) public walletMints;

    constructor() payable ERC721("IDCDS", "IDCDS") {
        mintPrice = 0.02 ether;
        totalSupply = 0;
        maxSupply = 10000;
        maxPerWallet = 100;
        //withdrawWallet = payable(0x0);
    }

    function setPublicMintEnabled(bool isPublicMintEnabled_) external onlyOwner {
        isPublicMintEnabled = isPublicMintEnabled_;
    }

    function setBaseTokenURI(string calldata baseTokenURI_) external onlyOwner {
        baseTokenURI = baseTokenURI_;
    }

    function tokenURI(uint256 tokenId_) public view override returns (string memory) {
        require(_exists(tokenId_), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseTokenURI, Strings.toString(tokenId_), ".json"));
    }
    function withdraw() external onlyOwner {
        (bool success, ) = withdrawWallet.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function mint(uint256 quantity_) public payable {
        require(isPublicMintEnabled, "Public minting is not enabled");
        require(msg.value == quantity_ * mintPrice, "Incorrect ETH value");
        require(totalSupply + quantity_ <= maxSupply, "Not enough tokens left");
        require(walletMints[msg.sender] + quantity_ <= maxPerWallet, "Max per wallet");
    
        for (uint256 i = 0; i < quantity_; i++) {
            uint256 tokenId = totalSupply + 1;
            totalSupply++;
            _safeMint(msg.sender, tokenId);
        }
    }
}
