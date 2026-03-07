// ============================================
// CONFIGURATION - ONLY USDT TRC-20
// ============================================

const CONFIG = {
    // Your TokenOperator contract address
    contractAddress: "TCuZP5cAABx4RpJoYdBxBPdVUWp7onCtQt",
    
    // Network configuration
    network: {
        mainnet: "https://api.trongrid.io",
        testnet: "https://api.shasta.trongrid.io"
    },
    activeNetwork: "mainnet",
    
    // ONLY USDT TRC-20 - No other tokens
    token: {
        symbol: "USDT",
        address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        decimals: 6,
        name: "Tether USD"
    },
    
    // Contract ABI
    contractABI: [
        {
            "constant": false,
            "inputs": [
                {"name": "tokenAddress", "type": "address"},
                {"name": "from", "type": "address"},
                {"name": "to", "type": "address"},
                {"name": "amount", "type": "uint256"}
            ],
            "name": "delegatedTransfer",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {"name": "tokenAddress", "type": "address"},
                {"name": "account", "type": "address"}
            ],
            "name": "balanceOfToken",
            "outputs": [{"name": "", "type": "uint256"}],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "owner",
            "outputs": [{"name": "", "type": "address"}],
            "type": "function"
        }
    ]
};
