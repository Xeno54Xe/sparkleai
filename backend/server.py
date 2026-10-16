from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import datetime
import math
import os
from zoneinfo import ZoneInfo

app = Flask(__name__)
CORS(app)

IST = ZoneInfo('Asia/Kolkata')


def fmt_inr(value, suffix='', scale=1):
    """Format a number as rupees, or '—' if yfinance didn't provide it."""
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return '—'
    return f"₹{value / scale:,.2f}{suffix}"


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/stock', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol', 'RELIANCE').strip().upper()
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
        if price is None or prev_close is None or math.isnan(price):
            return jsonify({'error': f"No price data for {symbol} (delisted or renamed?)"}), 404
        change = price - prev_close
        percent_change = (change / prev_close) * 100 if prev_close else 0.0

        # Get History
        hist = stock.history(period=period, interval=interval)

        # If today is weekend/closed, 1D might return empty. Fallback to 5d.
        if hist.empty and timeframe == '1D':
            hist = stock.history(period='5d', interval='15m')
            # Slice to get only the last trading day if possible
            if not hist.empty:
                last_day = hist.index[-1].date()
                hist = hist[hist.index.date == last_day]

        # NaN closes would serialize to invalid JSON
        hist = hist.dropna(subset=['Close'])

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
                'value': round(float(row['Close']), 2),
                'label': label
            })

        volume = stock.fast_info.last_volume
        return jsonify({
            'symbol': symbol.replace('.NS', ''),
            'price': f"₹{price:,.2f}",
            'change_percent': f"{percent_change:+.2f}%",
            'is_up': bool(change >= 0),
            'market_status': 'Market Open' if is_market_open() else 'Market Closed',
            'graph_data': graph_data,
            'stats': [
                {'label': 'Open', 'value': fmt_inr(stock.fast_info.open)},
                {'label': 'High', 'value': fmt_inr(stock.fast_info.day_high)},
                {'label': 'Low', 'value': fmt_inr(stock.fast_info.day_low)},
                {'label': 'Prev. Close', 'value': fmt_inr(prev_close)},
                {'label': 'Mkt Cap', 'value': fmt_inr(stock.fast_info.market_cap, 'T', 1e12)},
                {'label': 'Volume', 'value': f"{volume / 1e6:.2f}M" if volume else '—'},
            ]
        })

    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500

def is_market_open():
    # NSE hours are in IST regardless of where the server runs
    now = datetime.datetime.now(IST)
    if now.weekday() >= 5: return False
    start = now.replace(hour=9, minute=15, second=0, microsecond=0)
    end = now.replace(hour=15, minute=30, second=0, microsecond=0)
    return start <= now <= end

if __name__ == '__main__':
    # Port 5000 is taken by macOS AirPlay Receiver, so default to 5001
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)), debug=True)
