// ============================================
// कॉन्फिगरेशन फाइल - अपनी वैल्यूज यहां डालें
// ============================================

const CONFIG = {
    // ✅ अपना कॉन्ट्रैक्ट एड्रेस यहां डालें (TRONScan से)
    contractAddress: "TCuZP5cAABx4RpJoYdBxBPdVUWp7onCtQt",
    
    // TRON नेटवर्क सेटिंग्स
    network: {
        mainnet: {
            fullHost: "https://api.trongrid.io",
            name: "Mainnet"
        },
        testnet: {
            fullHost: "https://api.shasta.trongrid.io",
            name: "Shasta Testnet"
        }
    },
    
    // कॉमन TRC-20 टोकन एड्रेस
    tokens: {
        USDT: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
        USDC: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
        TUSD: "TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4"
    },
    
    // एक्टिव नेटवर्क (mainnet या testnet)
    activeNetwork: "mainnet"
};

// नेटवर्क URL एक्सेस करने के लिए
const NETWORK_URL = CONFIG.network[CONFIG.activeNetwork].fullHost;
