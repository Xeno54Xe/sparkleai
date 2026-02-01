from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import datetime

app = Flask(__name__)
CORS(app)

@app.route('/stock', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', 'RELIANCE')
    timeframe = request.args.get('range', '1D') # Get timeframe request

    if not symbol.endswith('.NS'):
        symbol = f"{symbol}.NS"
    
    # --- 1. DETERMINE INTERVAL BASED ON RANGE ---
    # 1D = 1 Day data (5 min interval)
    # 1W = 5 Days data (15 min interval)
    # 1M = 1 Month data (Daily interval)
    # 1Y = 1 Year data (Daily interval)
    
    period = '1d'
    interval = '5m'
    
    if timeframe == '1W':
        period = '5d'
        interval = '15m'
    elif timeframe == '1M':
        period = '1mo'
        interval = '1d'
    elif timeframe == '1Y':
        period = '1y'
        interval = '1d'

    print(f"Fetching {symbol} for {period} ({interval})")

    try:
        stock = yf.Ticker(symbol)
        
        # Get Live Price (Fast)
        price = stock.fast_info.last_price
        prev_close = stock.fast_info.previous_close
        change = price - prev_close
        percent_change = (change / prev_close) * 100
        
        # Get History
        hist = stock.history(period=period, interval=interval)
        
        # If today is weekend/closed, 1D might return empty. Fallback to 5d.
        if hist.empty and timeframe == '1D':
            hist = stock.history(period='5d', interval='15m')
            # Slice to get only the last trading day if possible
            if not hist.empty:
                last_day = hist.index[-1].date()
                hist = hist[hist.index.date == last_day]

        graph_data = []
        hist.reset_index(inplace=True)
        
        for _, row in hist.iterrows():
            # Format Label based on Timeframe
            dt = row['Datetime'] if 'Datetime' in row else row['Date']
            
            if timeframe == '1D':
                label = dt.strftime('%H:%M')
            elif timeframe == '1W':
                label = dt.strftime('%a %H:%M') # Mon 10:00
            else:
                label = dt.strftime('%d %b') # 05 Feb

            graph_data.append({
                'value': round(row['Close'], 2),
                'label': label
            })

        return jsonify({
            'symbol': symbol.replace('.NS', ''),
            'price': f"₹{price:,.2f}",
            'change_percent': f"{percent_change:+.2f}%",
            'is_up': change > 0,
            'market_status': 'Market Open' if is_market_open() else 'Market Closed',
            'graph_data': graph_data,
            'stats': [
                {'label': 'Open', 'value': f"₹{stock.fast_info.open:,.2f}"},
                {'label': 'High', 'value': f"₹{stock.fast_info.day_high:,.2f}"},
                {'label': 'Low', 'value': f"₹{stock.fast_info.day_low:,.2f}"},
                {'label': 'Prev. Close', 'value': f"₹{prev_close:,.2f}"},
                {'label': 'Mkt Cap', 'value': f"₹{stock.fast_info.market_cap / 1000000000000:.2f}T"},
                {'label': 'Volume', 'value': f"{stock.fast_info.last_volume / 1000000:.2f}M"},
            ]
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500

def is_market_open():
    now = datetime.datetime.now()
    if now.weekday() >= 5: return False
    start = now.replace(hour=9, minute=15, second=0)
    end = now.replace(hour=15, minute=30, second=0)
    return start <= now <= end

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)