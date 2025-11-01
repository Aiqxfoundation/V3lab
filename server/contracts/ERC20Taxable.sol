// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ERC20Taxable {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    uint256 public taxPercentage;
    address public treasuryWallet;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TaxCollected(address indexed from, address indexed treasury, uint256 value);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        uint256 _taxPercentage,
        address _treasuryWallet
    ) {
        require(_taxPercentage <= 25, "Tax cannot exceed 25%");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        taxPercentage = _taxPercentage;
        treasuryWallet = _treasuryWallet;
        totalSupply = _totalSupply * (10 ** uint256(_decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "Transfer to zero address not allowed");
        require(to != treasuryWallet, "Cannot transfer directly to treasury");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        uint256 taxAmount = (value * taxPercentage) / 100;
        uint256 transferAmount = value - taxAmount;
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += transferAmount;
        balanceOf[treasuryWallet] += taxAmount;
        
        emit Transfer(msg.sender, to, transferAmount);
        if (taxAmount > 0) {
            emit TaxCollected(msg.sender, treasuryWallet, taxAmount);
            emit Transfer(msg.sender, treasuryWallet, taxAmount);
        }
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(to != address(0), "Transfer to zero address not allowed");
        require(to != treasuryWallet, "Cannot transfer directly to treasury");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        uint256 taxAmount = (value * taxPercentage) / 100;
        uint256 transferAmount = value - taxAmount;
        
        balanceOf[from] -= value;
        balanceOf[to] += transferAmount;
        balanceOf[treasuryWallet] += taxAmount;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, transferAmount);
        if (taxAmount > 0) {
            emit TaxCollected(from, treasuryWallet, taxAmount);
            emit Transfer(from, treasuryWallet, taxAmount);
        }
        return true;
    }
}
