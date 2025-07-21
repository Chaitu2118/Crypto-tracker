from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

# CoinGecko API endpoints
API_BASE_URL = "https://api.coingecko.com/api/v3"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/cryptos')
def get_cryptos():
    try:
        # Get top 100 cryptocurrencies by market cap
        response = requests.get(f"{API_BASE_URL}/coins/markets", params={
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 100,
            'page': 1,
            'sparkline': False
        })
        response.raise_for_status()
        data = response.json()
        
        # Simplify the data structure
        cryptos = []
        for coin in data:
            cryptos.append({
                'id': coin['id'],
                'symbol': coin['symbol'].upper(),
                'name': coin['name'],
                'image': coin['image'],
                'current_price': coin['current_price'],
                'price_change_percentage_24h': coin['price_change_percentage_24h'],
                'market_cap': coin['market_cap']
            })
        
        return jsonify(cryptos)
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)