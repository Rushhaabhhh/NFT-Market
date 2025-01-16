// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

error InvalidPrice();
error NotApprovedForMarketplace();
error InvalidAuctionEndTime();
error NotListed();
error AlreadySold();
error IsOnAuction();
error IncorrectPrice();
error InactiveBid();
error BidTooLow();
error AuctionEnded();
error AuctionNotEnded();
error NoFundsToWithdraw();
error InvalidFee();
error ArrayLengthMismatch();
error NotTokenOwner();
error TokenNotExists();

contract NFTMarketplace is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    uint256 public marketplaceFee = 250;
    
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isSold;
        bool isAuction;
        uint256 royaltyPercentage;
    }

    struct Auction {
        uint256 startPrice;
        uint256 endTime;
        address payable highestBidder;
        uint256 highestBid;
        bool isActive;
        mapping(address => uint256) bids;
    }

    mapping(uint256 => MarketItem) public marketItems;
    mapping(uint256 => Auction) public tokenAuctions;
    mapping(uint256 => uint256) public tokenRoyalties;

    event ItemListed(uint256 indexed tokenId, address indexed seller, uint256 price, bool isAuction);
    event ItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event AuctionFinalized(uint256 indexed tokenId, address indexed winner, uint256 amount);
    event RoyaltySet(uint256 indexed tokenId, uint256 percentage);

    modifier onlyTokenOwner(uint256 tokenId) {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        if (ownerOf(tokenId) == address(0)) revert TokenNotExists();
        _;
    }

    modifier validListing(uint256 tokenId) {
        if (marketItems[tokenId].seller == address(0)) revert NotListed();
        if (marketItems[tokenId].isSold) revert AlreadySold();
        _;
    }

    constructor() ERC721("NFTMarketplace", "NFTM") Ownable(msg.sender) {}

    function mintNFT(
        address recipient, 
        string memory metadataURI,
        uint256 royaltyPercentage
    ) public whenNotPaused returns (uint256) {
        if (royaltyPercentage > 1000) revert InvalidFee(); // Max 10%
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        if (royaltyPercentage > 0) {
            tokenRoyalties[newTokenId] = royaltyPercentage;
            emit RoyaltySet(newTokenId, royaltyPercentage);
        }

        return newTokenId;
    }

    function listNFTForSale(
        uint256 tokenId,
        uint256 price,
        bool isAuction,
        uint256 auctionEndTime
    ) public whenNotPaused tokenExists(tokenId) onlyTokenOwner(tokenId) {
        if (price == 0) revert InvalidPrice();
        if (getApproved(tokenId) != address(this)) revert NotApprovedForMarketplace();

        marketItems[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            price,
            false,
            isAuction,
            tokenRoyalties[tokenId]
        );

        if (isAuction) {
            if (auctionEndTime <= block.timestamp) revert InvalidAuctionEndTime();
            Auction storage auction = tokenAuctions[tokenId];
            auction.startPrice = price;
            auction.endTime = auctionEndTime;
            auction.isActive = true;
        }

        emit ItemListed(tokenId, msg.sender, price, isAuction);
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant whenNotPaused validListing(tokenId) {
        MarketItem storage item = marketItems[tokenId];
        if (item.isAuction) revert IsOnAuction();
        if (msg.value != item.price) revert IncorrectPrice();

        processSale(tokenId, msg.sender, msg.value);
    }

    function placeBid(uint256 tokenId) public payable nonReentrant whenNotPaused validListing(tokenId) {
        Auction storage auction = tokenAuctions[tokenId];
        if (!auction.isActive) revert InactiveBid();
        if (block.timestamp >= auction.endTime) revert AuctionEnded();
        if (msg.value <= auction.highestBid) revert BidTooLow();

        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;
        auction.bids[msg.sender] = msg.value;

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function finalizeAuction(uint256 tokenId) public nonReentrant whenNotPaused validListing(tokenId) {
        Auction storage auction = tokenAuctions[tokenId];
        if (!auction.isActive) revert InactiveBid();
        if (block.timestamp < auction.endTime) revert AuctionNotEnded();

        if (auction.highestBidder != address(0)) {
            processSale(tokenId, auction.highestBidder, auction.highestBid);
            emit AuctionFinalized(tokenId, auction.highestBidder, auction.highestBid);
        }

        auction.isActive = false;
    }

    function processSale(
        uint256 tokenId,
        address buyer,
        uint256 price
    ) internal {
        MarketItem storage item = marketItems[tokenId];
        
        uint256 marketplaceFeeAmount = (price * marketplaceFee) / 10000;
        uint256 royaltyAmount = (price * item.royaltyPercentage) / 10000;
        uint256 sellerAmount = price - marketplaceFeeAmount - royaltyAmount;

        _transfer(item.seller, buyer, tokenId);

        if (marketplaceFeeAmount > 0) {
            payable(owner()).transfer(marketplaceFeeAmount);
        }
        if (royaltyAmount > 0) {
            payable(ownerOf(tokenId)).transfer(royaltyAmount);
        }
        payable(item.seller).transfer(sellerAmount);

        item.isSold = true;

        emit ItemSold(tokenId, item.seller, buyer, price);
    }

    function setMarketplaceFee(uint256 newFee) public onlyOwner {
        if (newFee > 1000) revert InvalidFee(); // Max 10%
        marketplaceFee = newFee;
    }

    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        payable(owner()).transfer(balance);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}