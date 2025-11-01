export interface TokenFeatures {
  isMintable: boolean;
  isBurnable: boolean;
  isPausable: boolean;
  isCapped: boolean;
  hasTax: boolean;
  hasBlacklist: boolean;
}

export function generateEvmTokenContract(features: TokenFeatures): string {
  const hasAnyFeature = Object.values(features).some(v => v);
  
  if (!hasAnyFeature) {
    return generateStandardToken();
  }
  
  return generateAdvancedToken(features);
}

function generateStandardToken(): string {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StandardToken is ERC20 {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimalsValue,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _decimals = decimalsValue;
        _mint(msg.sender, initialSupply);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}`;
}

function generateAdvancedToken(features: TokenFeatures): string {
  const imports: string[] = [
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/access/Ownable.sol',
  ];
  
  const inherits: string[] = ['ERC20', 'Ownable'];
  const stateVariables: string[] = [];
  const constructorParams: string[] = [];
  const constructorBody: string[] = [];
  const functions: string[] = [];
  
  if (features.isPausable) {
    imports.push('@openzeppelin/contracts/utils/Pausable.sol');
    inherits.push('Pausable');
  }
  
  if (features.isCapped) {
    stateVariables.push('    uint256 private _cap;');
  }
  
  if (features.hasTax) {
    stateVariables.push('    uint256 public taxPercentage;');
    stateVariables.push('    address public treasuryWallet;');
  }
  
  if (features.hasBlacklist) {
    stateVariables.push('    mapping(address => bool) private _blacklisted;');
  }
  
  stateVariables.push('    uint8 private _decimals;');
  
  // Constructor parameters
  constructorParams.push('        string memory name');
  constructorParams.push('        string memory symbol');
  constructorParams.push('        uint8 decimalsValue');
  constructorParams.push('        uint256 initialSupply');
  constructorParams.push('        bool mintable');
  constructorParams.push('        bool burnable');
  constructorParams.push('        bool pausable');
  constructorParams.push('        bool capped');
  constructorParams.push('        bool taxable');
  constructorParams.push('        bool blacklistable');
  constructorParams.push('        uint256 maxSupply');
  constructorParams.push('        uint256 taxRate');
  constructorParams.push('        address treasury');
  
  // Constructor body
  constructorBody.push('        _decimals = decimalsValue;');
  
  if (features.isCapped) {
    constructorBody.push('        if (capped) {');
    constructorBody.push('            require(maxSupply > 0, "Cap must be greater than 0");');
    constructorBody.push('            _cap = maxSupply;');
    constructorBody.push('        }');
  }
  
  if (features.hasTax) {
    constructorBody.push('        if (taxable) {');
    constructorBody.push('            require(taxRate <= 1000, "Tax cannot exceed 10%");');
    constructorBody.push('            taxPercentage = taxRate;');
    constructorBody.push('            treasuryWallet = treasury;');
    constructorBody.push('        }');
  }
  
  constructorBody.push('        if (initialSupply > 0) {');
  if (features.isCapped) {
    constructorBody.push('            if (capped) {');
    constructorBody.push('                require(initialSupply <= _cap, "Initial supply exceeds cap");');
    constructorBody.push('            }');
  }
  constructorBody.push('            _mint(msg.sender, initialSupply);');
  constructorBody.push('        }');
  
  // Functions
  if (features.isMintable) {
    let mintFunction = `    function mint(address to, uint256 amount) public onlyOwner`;
    if (features.isPausable) mintFunction += ' whenNotPaused';
    mintFunction += ' {\n';
    if (features.isCapped) {
      mintFunction += '        if (_cap > 0) {\n';
      mintFunction += '            require(totalSupply() + amount <= _cap, "Cap exceeded");\n';
      mintFunction += '        }\n';
    }
    mintFunction += '        _mint(to, amount);\n';
    mintFunction += '    }';
    functions.push(mintFunction);
  }
  
  if (features.isBurnable) {
    let burnFunction = `    function burn(uint256 amount) public`;
    if (features.isPausable) burnFunction += ' whenNotPaused';
    burnFunction += ' {\n';
    burnFunction += '        _burn(msg.sender, amount);\n';
    burnFunction += '    }';
    functions.push(burnFunction);
  }
  
  if (features.isPausable) {
    functions.push(`    function pause() public onlyOwner {
        _pause();
    }`);
    functions.push(`    function unpause() public onlyOwner {
        _unpause();
    }`);
  }
  
  if (features.hasBlacklist) {
    functions.push(`    function blacklist(address account) public onlyOwner {
        _blacklisted[account] = true;
    }`);
    functions.push(`    function unblacklist(address account) public onlyOwner {
        _blacklisted[account] = false;
    }`);
    functions.push(`    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }`);
  }
  
  if (features.isCapped) {
    functions.push(`    function cap() public view returns (uint256) {
        return _cap;
    }`);
  }
  
  functions.push(`    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }`);
  
  // Transfer override if needed
  if (features.hasTax || features.hasBlacklist || features.isPausable) {
    let transferOverride = `    function _update(address from, address to, uint256 value) internal`;
    if (features.isPausable) transferOverride += ' whenNotPaused';
    transferOverride += ' override {\n';
    
    if (features.hasBlacklist) {
      transferOverride += '        require(!_blacklisted[from], "Sender is blacklisted");\n';
      transferOverride += '        require(!_blacklisted[to], "Recipient is blacklisted");\n';
    }
    
    if (features.hasTax) {
      transferOverride += '        if (taxPercentage > 0 && from != address(0) && to != address(0) && from != owner() && to != owner()) {\n';
      transferOverride += '            uint256 taxAmount = (value * taxPercentage) / 10000;\n';
      transferOverride += '            uint256 sendAmount = value - taxAmount;\n';
      transferOverride += '            super._update(from, treasuryWallet, taxAmount);\n';
      transferOverride += '            super._update(from, to, sendAmount);\n';
      transferOverride += '        } else {\n';
      transferOverride += '            super._update(from, to, value);\n';
      transferOverride += '        }\n';
    } else {
      transferOverride += '        super._update(from, to, value);\n';
    }
    
    transferOverride += '    }';
    functions.push(transferOverride);
  }
  
  // Generate the full contract
  const importStatements = imports.map(imp => `import "${imp}";`).join('\n');
  const contractInheritance = inherits.join(', ');
  
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

${importStatements}

contract AdvancedToken is ${contractInheritance} {
${stateVariables.join('\n')}

    constructor(
${constructorParams.join(',\n')}
    ) ERC20(name, symbol) Ownable(msg.sender) {
${constructorBody.join('\n')}
    }

${functions.join('\n\n')}
}`;
}

export function getContractCompilationArtifacts(contractType: 'standard' | 'advanced') {
  if (contractType === 'standard') {
    return {
      abi: STANDARD_TOKEN_ABI,
      bytecode: STANDARD_TOKEN_BYTECODE_PLACEHOLDER
    };
  }
  return {
    abi: ADVANCED_TOKEN_ABI,
    bytecode: ADVANCED_TOKEN_BYTECODE_PLACEHOLDER
  };
}

const STANDARD_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "uint8", "name": "decimalsValue", "type": "uint8"},
      {"internalType": "uint256", "name": "initialSupply", "type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "spender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Approval", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
];

const ADVANCED_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "uint8", "name": "decimalsValue", "type": "uint8"},
      {"internalType": "uint256", "name": "initialSupply", "type": "uint256"},
      {"internalType": "bool", "name": "mintable", "type": "bool"},
      {"internalType": "bool", "name": "burnable", "type": "bool"},
      {"internalType": "bool", "name": "pausable", "type": "bool"},
      {"internalType": "bool", "name": "capped", "type": "bool"},
      {"internalType": "bool", "name": "taxable", "type": "bool"},
      {"internalType": "bool", "name": "blacklistable", "type": "bool"},
      {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "taxRate", "type": "uint256"},
      {"internalType": "address", "name": "treasury", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "spender", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Approval", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"}, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}], "name": "OwnershipTransferred", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}], "name": "Paused", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": true, "internalType": "address", "name": "from", "type": "address"}, {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}], "name": "Transfer", "type": "event"},
  {"anonymous": false, "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}], "name": "Unpaused", "type": "event"},
  {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "blacklist", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "cap", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "isBlacklisted", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "paused", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "taxPercentage", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "value", "type": "uint256"}], "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "treasuryWallet", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "unblacklist", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
];

const STANDARD_TOKEN_BYTECODE_PLACEHOLDER = "0x608060405234801561001057600080fd5b50";
const ADVANCED_TOKEN_BYTECODE_PLACEHOLDER = "0x608060405234801561001057600080fd5b50";
