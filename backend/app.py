from flask import Flask, request, jsonify
import pandas as pd
import requests
import io
from flask_cors import CORS # Ensure this is installed: pip install flask-cors

app = Flask(__name__)
CORS(app) # This allows your phone to talk to your laptop freely

MASTER_STOCKS = []

def load_master_list():
    global MASTER_STOCKS
    print("--- Initializing Master Stock List ---")
    try:
        url = "https://archives.nseindia.com/content/equities/EQUITY_LST.csv"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
            MASTER_STOCKS = df[['SYMBOL', 'NAME OF COMPANY']].rename(
                columns={'SYMBOL': 'symbol', 'NAME OF COMPANY': 'name'}
            ).to_dict(orient='records')
            print(f"SUCCESS: Loaded {len(MASTER_STOCKS)} stocks.")
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

load_master_list()

@app.route('/debug', methods=['GET'])
def debug_conn():
    return jsonify({"status": "Online", "count": len(MASTER_STOCKS)})

@app.route('/search', methods=['GET'])
def search_stocks():
    query = request.args.get('query', '').strip().upper()
    if not query or len(query) < 2:
        return jsonify([])
    
    results = [
        s for s in MASTER_STOCKS 
        if query in str(s['symbol']).upper() or query in str(s['name']).upper()
    ]
    print(f"Search for '{query}' returned {len(results)} matches.")
    return jsonify(results[:15])

if __name__ == '__main__':
    # host='0.0.0.0' is non-negotiable for mobile testing
    app.run(host='0.0.0.0', port=5000, debug=True)