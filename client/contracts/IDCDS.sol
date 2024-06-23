// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract IDCDS is ERC721, Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    uint256 public mintPrice;
    uint256 public totalSupply;
    uint256 public maxSupply;
    bool public isPublicMintEnabled;
    uint public maxPerWallet;
    address payable public withdrawWallet;
    mapping (address => uint) public walletMints;

    mapping(uint256 => string) private _tokenURIs;
    mapping(address => EnumerableSet.UintSet) private _tokensByOwner;

    constructor() payable ERC721("IDCDS", "IDCDS") {
        mintPrice = 0.0002 ether;
        totalSupply = 0;
        maxSupply = 10000;
        maxPerWallet = 100;
    }

    function setPublicMintEnabled(bool isPublicMintEnabled_) external onlyOwner {
        isPublicMintEnabled = isPublicMintEnabled_;
    }

    function getOwnedTokens(address owner) external view returns (uint256[] memory) {
        uint256[] memory ownedTokens = new uint256[](_tokensByOwner[owner].length());
        for (uint256 i = 0; i < _tokensByOwner[owner].length(); i++) {
            ownedTokens[i] = _tokensByOwner[owner].at(i);
        }
        return ownedTokens;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = withdrawWallet.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function mint(uint256 quantity_, string calldata tokenURI_) public payable {
        require(isPublicMintEnabled, "Public minting is not enabled");
        require(msg.value == quantity_ * mintPrice, "Incorrect ETH value");
        require(totalSupply + quantity_ <= maxSupply, "Not enough tokens left");
        require(walletMints[msg.sender] + quantity_ <= maxPerWallet, "Max per wallet");
    
        for (uint256 i = 0; i < quantity_; i++) {
            uint256 tokenId = totalSupply + 1;
            totalSupply++;
            _safeMint(msg.sender, tokenId);
            _setTokenURI(tokenId, tokenURI_);
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from != address(0)) {
            _tokensByOwner[from].remove(tokenId);
        }
        if (to != address(0)) {
            _tokensByOwner[to].add(tokenId);
        }
    }

    function _setTokenURI(uint256 tokenId, string memory tokenURI_) internal {
        // Set the tokenURI for tokenId
        _tokenURIs[tokenId] = tokenURI_;
        emit TokenURISet(tokenId, tokenURI_);
    }

    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    event TokenURISet(uint256 indexed tokenId, string tokenURI);
}