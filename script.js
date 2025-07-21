document.addEventListener('DOMContentLoaded', function() {
    const cryptoList = document.getElementById('crypto-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const refreshBtn = document.getElementById('refresh-btn');
    const lastUpdatedSpan = document.getElementById('last-updated');
    
    let cryptoData = [];
    
    // Fetch crypto data
    function fetchCryptoData() {
        cryptoList.innerHTML = '<div class="loading">Loading cryptocurrency data...</div>';
        
        fetch('/api/cryptos')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                cryptoData = data;
                updateLastUpdated();
                renderCryptoList(cryptoData);
            })
            .catch(error => {
                console.error('Error fetching crypto data:', error);
                cryptoList.innerHTML = `<div class="loading error">Error loading data: ${error.message}</div>`;
            });
    }
    
    // Render crypto list
    function renderCryptoList(data) {
        if (data.length === 0) {
            cryptoList.innerHTML = '<div class="loading">No cryptocurrencies found matching your search.</div>';
            return;
        }
        
        cryptoList.innerHTML = '';
        
        data.forEach(crypto => {
            const change24h = crypto.price_change_percentage_24h;
            const changeClass = change24h >= 0 ? 'change-up' : 'change-down';
            const changeIcon = change24h >= 0 ? '▲' : '▼';
            
            const cryptoCard = document.createElement('div');
            cryptoCard.className = 'crypto-card';
            cryptoCard.innerHTML = `
                <div class="crypto-header">
                    <img src="${crypto.image}" alt="${crypto.name}" class="crypto-icon">
                    <div>
                        <span class="crypto-name">${crypto.name}</span>
                        <span class="crypto-symbol">${crypto.symbol}</span>
                    </div>
                </div>
                <div class="crypto-price">$${crypto.current_price.toLocaleString()}</div>
                <div class="crypto-change ${changeClass}">
                    ${changeIcon} ${Math.abs(change24h).toFixed(2)}%
                </div>
                <div class="crypto-market-cap">Market Cap: $${crypto.market_cap.toLocaleString()}</div>
            `;
            
            cryptoList.appendChild(cryptoCard);
        });
    }
    
    // Update last updated time
    function updateLastUpdated() {
        const now = new Date();
        lastUpdatedSpan.textContent = now.toLocaleTimeString();
    }
    
    // Filter and sort crypto data
    function filterAndSortCrypto() {
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;
        
        let filteredData = cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(searchTerm) || 
            crypto.symbol.toLowerCase().includes(searchTerm)
        );
        
        // Sort data
        switch(sortBy) {
            case 'market_cap':
                filteredData.sort((a, b) => b.market_cap - a.market_cap);
                break;
            case 'price':
                filteredData.sort((a, b) => b.current_price - a.current_price);
                break;
            case '24h_change':
                filteredData.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
                break;
            case 'name':
                filteredData.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        renderCryptoList(filteredData);
    }
    
    // Event listeners
    searchInput.addEventListener('input', filterAndSortCrypto);
    sortSelect.addEventListener('change', filterAndSortCrypto);
    refreshBtn.addEventListener('click', fetchCryptoData);
    
    // Initial load
    fetchCryptoData();
    
    // Auto-refresh every 5 minutes
    setInterval(fetchCryptoData, 5 * 60 * 1000);
});