// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC20Advanced
 * @dev Fully ERC20 compliant token with modular features and authority management
 * Features: Mintable, Burnable, Pausable, Capped Supply, Transfer Tax, Blacklist
 * All features can be combined and authorities can be renounced independently
 * 
 * IMPORTANT: This contract accepts pre-scaled values (already multiplied by 10^decimals)
 */
contract ERC20Advanced {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;
    
    // Feature flags (immutable after deployment)
    bool public immutable isMintable;
    bool public immutable isBurnable;
    bool public immutable isPausable;
    bool public immutable isCapped;
    bool public immutable hasTax;
    bool public immutable hasBlacklist;
    
    // Feature-specific state
    bool public paused;
    uint256 public immutable maxSupply;
    uint256 public immutable taxPercentage;
    address public immutable treasuryWallet;
    
    // Authority revocation tracking
    bool public mintingRevoked;
    bool public pausingRevoked;
    bool public blacklistingRevoked;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public blacklisted;
    
    // Events - ERC20 Standard
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Events - Extended functionality
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MintingRevoked();
    event PausingRevoked();
    event BlacklistingRevoked();
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        require(owner != address(0), "Ownership has been renounced");
        _;
    }
    
    modifier whenNotPaused() {
        require(!isPausable || !paused, "Token transfers are paused");
        _;
    }
    
    modifier notBlacklisted(address account) {
        require(!hasBlacklist || !blacklisted[account], "Address is blacklisted");
        _;
    }
    
    /**
     * @dev Constructor - accepts PRE-SCALED values (already multiplied by 10^decimals)
     * @param _initialSupply Already scaled (e.g., for 1000 tokens with 18 decimals, pass 1000 * 10^18)
     * @param _maxSupply Already scaled (0 if not capped)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply,
        bool _isMintable,
        bool _isBurnable,
        bool _isPausable,
        bool _isCapped,
        bool _hasTax,
        bool _hasBlacklist,
        uint256 _maxSupply,
        uint256 _taxPercentage,
        address _treasuryWallet
    ) {
        require(_initialSupply > 0, "Initial supply must be positive");
        require(_decimals <= 18, "Decimals must be <= 18");
        
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        
        // Set immutable feature flags
        isMintable = _isMintable;
        isBurnable = _isBurnable;
        isPausable = _isPausable;
        isCapped = _isCapped;
        hasTax = _hasTax;
        hasBlacklist = _hasBlacklist;
        
        // Validate and set feature-specific parameters
        // Immutable variables must be assigned once, so we use ternary for conditional assignment
        if (_isCapped) {
            require(_maxSupply > 0, "Max supply required for capped token");
            require(_initialSupply <= _maxSupply, "Initial supply exceeds max supply");
        }
        maxSupply = _isCapped ? _maxSupply : 0;
        
        if (_hasTax) {
            require(_taxPercentage > 0 && _taxPercentage <= 25, "Tax must be 1-25%");
            require(_treasuryWallet != address(0), "Treasury wallet required for tax");
        }
        taxPercentage = _hasTax ? _taxPercentage : 0;
        treasuryWallet = _hasTax ? _treasuryWallet : address(0);
        
        // Mint initial supply to deployer
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        emit Transfer(address(0), msg.sender, _initialSupply);
    }
    
    // ======== ERC20 STANDARD FUNCTIONS ========
    
    function transfer(address to, uint256 value) 
        public 
        whenNotPaused 
        notBlacklisted(msg.sender) 
        notBlacklisted(to) 
        returns (bool) 
    {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[msg.sender] >= value, "ERC20: insufficient balance");
        
        uint256 transferAmount = value;
        uint256 taxAmount = 0;
        
        // Apply tax if enabled (only for non-owner transfers)
        if (hasTax && msg.sender != owner && treasuryWallet != address(0)) {
            taxAmount = (value * taxPercentage) / 100;
            transferAmount = value - taxAmount;
            
            // Transfer tax to treasury
            balanceOf[msg.sender] -= value;
            balanceOf[treasuryWallet] += taxAmount;
            balanceOf[to] += transferAmount;
            
            emit Transfer(msg.sender, treasuryWallet, taxAmount);
            emit Transfer(msg.sender, to, transferAmount);
        } else {
            // Standard transfer
            balanceOf[msg.sender] -= value;
            balanceOf[to] += value;
            emit Transfer(msg.sender, to, value);
        }
        
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0), "ERC20: approve to zero address");
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) 
        public 
        whenNotPaused 
        notBlacklisted(from) 
        notBlacklisted(to) 
        returns (bool) 
    {
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= value, "ERC20: insufficient balance");
        require(allowance[from][msg.sender] >= value, "ERC20: insufficient allowance");
        
        uint256 transferAmount = value;
        uint256 taxAmount = 0;
        
        // Apply tax if enabled (only for non-owner transfers)
        if (hasTax && from != owner && treasuryWallet != address(0)) {
            taxAmount = (value * taxPercentage) / 100;
            transferAmount = value - taxAmount;
            
            // Transfer with tax
            balanceOf[from] -= value;
            balanceOf[treasuryWallet] += taxAmount;
            balanceOf[to] += transferAmount;
            allowance[from][msg.sender] -= value;
            
            emit Transfer(from, treasuryWallet, taxAmount);
            emit Transfer(from, to, transferAmount);
        } else {
            // Standard transfer
            balanceOf[from] -= value;
            balanceOf[to] += value;
            allowance[from][msg.sender] -= value;
            emit Transfer(from, to, value);
        }
        
        return true;
    }
    
    // ======== MINTABLE FUNCTIONS ========
    
    /**
     * @dev Mint new tokens (value is PRE-SCALED)
     * @param value Already scaled amount (e.g., for 100 tokens with 18 decimals, pass 100 * 10^18)
     */
    function mint(address to, uint256 value) public onlyOwner returns (bool) {
        require(isMintable, "Minting not enabled");
        require(!mintingRevoked, "Minting has been revoked");
        require(to != address(0), "Cannot mint to zero address");
        
        if (isCapped) {
            require(totalSupply + value <= maxSupply, "Exceeds max supply");
        }
        
        totalSupply += value;
        balanceOf[to] += value;
        
        emit Mint(to, value);
        emit Transfer(address(0), to, value);
        return true;
    }
    
    function revokeMinting() public onlyOwner {
        require(isMintable, "Minting not enabled");
        require(!mintingRevoked, "Already revoked");
        mintingRevoked = true;
        emit MintingRevoked();
    }
    
    // ======== BURNABLE FUNCTIONS ========
    
    /**
     * @dev Burn tokens (value is PRE-SCALED)
     */
    function burn(uint256 value) public returns (bool) {
        require(isBurnable, "Burning not enabled");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        
        emit Burn(msg.sender, value);
        emit Transfer(msg.sender, address(0), value);
        return true;
    }
    
    // ======== PAUSABLE FUNCTIONS ========
    
    function pause() public onlyOwner {
        require(isPausable, "Pausing not enabled");
        require(!pausingRevoked, "Pausing has been revoked");
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() public onlyOwner {
        require(isPausable, "Pausing not enabled");
        require(!pausingRevoked, "Pausing has been revoked");
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function revokePausing() public onlyOwner {
        require(isPausable, "Pausing not enabled");
        require(!pausingRevoked, "Already revoked");
        pausingRevoked = true;
        // Auto-unpause when revoking
        if (paused) {
            paused = false;
            emit Unpaused(msg.sender);
        }
        emit PausingRevoked();
    }
    
    // ======== BLACKLIST FUNCTIONS ========
    
    function blacklistAddress(address account) public onlyOwner {
        require(hasBlacklist, "Blacklisting not enabled");
        require(!blacklistingRevoked, "Blacklisting has been revoked");
        require(account != address(0), "Cannot blacklist zero address");
        require(account != owner, "Cannot blacklist owner");
        require(!blacklisted[account], "Already blacklisted");
        blacklisted[account] = true;
        emit Blacklisted(account);
    }
    
    function unblacklistAddress(address account) public onlyOwner {
        require(hasBlacklist, "Blacklisting not enabled");
        require(!blacklistingRevoked, "Blacklisting has been revoked");
        require(blacklisted[account], "Not blacklisted");
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }
    
    function revokeBlacklisting() public onlyOwner {
        require(hasBlacklist, "Blacklisting not enabled");
        require(!blacklistingRevoked, "Already revoked");
        blacklistingRevoked = true;
        emit BlacklistingRevoked();
    }
    
    // ======== OWNERSHIP FUNCTIONS ========
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    function renounceOwnership() public onlyOwner {
        address oldOwner = owner;
        owner = address(0);
        emit OwnershipTransferred(oldOwner, address(0));
    }
    
    // ======== VIEW FUNCTIONS ========
    
    function getFeatures() public view returns (
        bool _isMintable,
        bool _isBurnable,
        bool _isPausable,
        bool _isCapped,
        bool _hasTax,
        bool _hasBlacklist
    ) {
        return (isMintable, isBurnable, isPausable, isCapped, hasTax, hasBlacklist);
    }
    
    function getAuthorityStatus() public view returns (
        bool _mintingRevoked,
        bool _pausingRevoked,
        bool _blacklistingRevoked,
        address _currentOwner
    ) {
        return (mintingRevoked, pausingRevoked, blacklistingRevoked, owner);
    }
}
