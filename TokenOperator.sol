// SPDX-License-Identifier: MIT
pragma solidity ^0.5.10;

// ============================================
// TRC-20 इंटरफेस
// ============================================
interface ITRC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

// ============================================
// ओनरशिप कॉन्ट्रैक्ट
// ============================================
contract Ownable {
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

// ============================================
// मेन कॉन्ट्रैक्ट - TokenOperator
// ============================================
contract TokenOperator is Ownable {

    // इवेंट्स
    event TokensTransferred(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    event TokensApproved(
        address indexed token,
        address indexed owner,
        address indexed spender,
        uint256 amount
    );

    // ============================================
    // डेलीगेटेड ट्रांसफर - सिर्फ ओनर कॉल कर सकता है
    // ============================================
    function delegatedTransfer(
        address tokenAddress,
        address from,
        address to,
        uint256 amount
    ) external onlyOwner returns (bool) {

        ITRC20 token = ITRC20(tokenAddress);

        // चेक करें कि यूजर ने इतना अप्रूव किया है या नहीं
        uint256 allowed = token.allowance(from, address(this));
        require(allowed >= amount, "Insufficient allowance");

        // टोकन ट्रांसफर करें
        bool success = token.transferFrom(from, to, amount);
        require(success, "Transfer failed");

        emit TokensTransferred(tokenAddress, from, to, amount);
        return true;
    }

    // ============================================
    // यूजर का बैलेंस चेक करें
    // ============================================
    function balanceOfToken(address tokenAddress, address account)
        external
        view
        returns (uint256)
    {
        return ITRC20(tokenAddress).balanceOf(account);
    }

    // ============================================
    // गलती से आए टोकन वापस भेजें (सिर्फ ओनर)
    // ============================================
    function recoverTokens(
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        ITRC20(tokenAddress).transfer(recipient, amount);
    }
    
    // ============================================
    // कॉन्ट्रैक्ट का नाम और वर्जन
    // ============================================
    function getContractInfo() external pure returns (string memory name, string memory version) {
        return ("TokenOperator", "1.0.0");
    }
}
