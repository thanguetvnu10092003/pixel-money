import os
import io
import json
import calendar
import urllib.request
from datetime import datetime, date, timedelta
from flask import Flask, render_template, request, jsonify, send_file
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from database import get_db, init_db, calculate_wallet_balances, get_exchange_rates, convert_currency

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config['JSON_AS_ASCII'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.before_request
def setup_db_once():
    init_db()

# --- HELPER FUNCTIONS ---
def get_date_range_bounds(period='month', specific_date=None):
    """Calculate start and end dates based on period"""
    now = datetime.now() if not specific_date else datetime.strptime(specific_date, '%Y-%m-%d')
    today = now.date()
    
    if period == 'day':
        start_date = today
        end_date = today
    elif period == 'week':
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
    elif period == 'month':
        start_date = date(today.year, today.month, 1)
        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = date(today.year, today.month, last_day)
    elif period == 'year':
        start_date = date(today.year, 1, 1)
        end_date = date(today.year, 12, 31)
    else: # 'all'
        start_date = date(2000, 1, 1)
        end_date = date(2099, 12, 31)
        
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

# --- WEB PAGE ROUTES ---
@app.route('/')
def index():
    return render_template('index.html')

# --- API ROUTES ---

# 1. CURRENCIES & EXCHANGE RATES API (NEW)
@app.route('/api/rates', methods=['GET'])
def get_rates_api():
    rates = get_exchange_rates()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'active_currency'")
    row = cursor.fetchone()
    active_curr = row['value'] if row else 'VND'
    conn.close()
    
    eur_usd = round(rates['EUR_VND'] / rates['USD_VND'], 4) if rates['USD_VND'] > 0 else 1.0866
    return jsonify({
        'success': True,
        'active_currency': active_curr,
        'rates': {
            'USD_VND': rates['USD_VND'],
            'EUR_VND': rates['EUR_VND'],
            'EUR_USD': eur_usd
        }
    })

@app.route('/api/rates', methods=['POST'])
def update_rates_api():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    rate_usd = float(data.get('rate_USD_VND', 25400))
    rate_eur = float(data.get('rate_EUR_VND', 27600))
    active_curr = data.get('active_currency', 'VND').upper()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('rate_USD_VND', ?)", (str(rate_usd),))
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('rate_EUR_VND', ?)", (str(rate_eur),))
    if active_curr in ['VND', 'EUR', 'USD']:
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('active_currency', ?)", (active_curr,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã cập nhật tỷ giá tiền tệ!'})

@app.route('/api/rates/sync', methods=['POST'])
def sync_rates_api():
    """Try to fetch latest real-time rates online with fallback"""
    rates = get_exchange_rates()
    try:
        req = urllib.request.Request(
            'https://open.er-api.com/v6/latest/EUR',
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req, timeout=4) as response:
            api_data = json.loads(response.read().decode('utf-8'))
            if api_data.get('result') == 'success':
                rates_data = api_data.get('rates', {})
                eur_vnd = float(rates_data.get('VND', rates['EUR_VND']))
                eur_usd = float(rates_data.get('USD', 1.0866))
                usd_vnd = eur_vnd / eur_usd if eur_usd > 0 else rates['USD_VND']
                
                conn = get_db()
                cursor = conn.cursor()
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('rate_USD_VND', ?)", (str(round(usd_vnd, 0)),))
                cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('rate_EUR_VND', ?)", (str(round(eur_vnd, 0)),))
                conn.commit()
                conn.close()
                return jsonify({
                    'success': True, 
                    'message': f'Đã đồng bộ tỷ giá online thành công: 1 EUR = {eur_vnd:,.0f} ₫, 1 USD = {usd_vnd:,.0f} ₫',
                    'rates': {'USD_VND': round(usd_vnd, 0), 'EUR_VND': round(eur_vnd, 0)}
                })
    except Exception as e:
        pass
    return jsonify({'success': True, 'message': 'Đã giữ tỷ giá thiết lập hiện tại!', 'rates': rates})

# 2. WALLETS / MONEY SOURCES API
@app.route('/api/wallets', methods=['GET'])
def get_wallets():
    rates = get_exchange_rates()
    wallets = calculate_wallet_balances()
    total_assets_vnd = sum(w['balance_vnd'] for w in wallets)
    total_assets_usd = convert_currency(total_assets_vnd, 'VND', 'USD', rates)
    total_assets_eur = convert_currency(total_assets_vnd, 'VND', 'EUR', rates)
    
    return jsonify({
        'success': True,
        'wallets': wallets,
        'total_assets_vnd': total_assets_vnd,
        'total_assets_usd': total_assets_usd,
        'total_assets_eur': total_assets_eur
    })

@app.route('/api/wallets', methods=['POST'])
def add_wallet():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', '').strip()
    wtype = data.get('type', 'bank')
    initial_balance = float(data.get('initial_balance', 0))
    currency = data.get('currency', 'VND').upper()
    icon = data.get('icon', '💳')
    color = data.get('color', '#00f0ff')
    note = data.get('note', '').strip()
    
    if not name:
        return jsonify({'success': False, 'message': 'Tên nguồn tiền không được để trống!'}), 400
    if currency not in ['VND', 'EUR', 'USD']:
        currency = 'VND'
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO wallets (name, type, initial_balance, currency, icon, color, note)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (name, wtype, initial_balance, currency, icon, color, note))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Đã tạo nguồn tiền mới ({currency})!'})

@app.route('/api/wallets/<int:w_id>', methods=['PUT'])
def update_wallet(w_id):
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', '').strip()
    wtype = data.get('type', 'bank')
    initial_balance = float(data.get('initial_balance', 0))
    currency = data.get('currency', 'VND').upper()
    icon = data.get('icon', '💳')
    color = data.get('color', '#00f0ff')
    note = data.get('note', '').strip()
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE wallets
        SET name = ?, type = ?, initial_balance = ?, currency = ?, icon = ?, color = ?, note = ?
        WHERE id = ?
    ''', (name, wtype, initial_balance, currency, icon, color, note, w_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã cập nhật nguồn tiền!'})

@app.route('/api/wallets/<int:w_id>', methods=['DELETE'])
def delete_wallet(w_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE transactions SET wallet_id = NULL WHERE wallet_id = ?', (w_id,))
    cursor.execute('UPDATE subscriptions SET wallet_id = NULL WHERE wallet_id = ?', (w_id,))
    cursor.execute('DELETE FROM wallet_transfers WHERE from_wallet_id = ? OR to_wallet_id = ?', (w_id, w_id))
    cursor.execute('DELETE FROM wallets WHERE id = ?', (w_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa nguồn tiền!'})

@app.route('/api/wallets/reset_defaults', methods=['POST'])
def reset_default_wallets():
    conn = get_db()
    cursor = conn.cursor()
    default_wallets = [
        ('Ví Tiền Mặt (VND)', 'cash', 2500000, 'VND', '💵', '#00ff66', 'Tiền mặt chi tiêu hàng ngày'),
        ('Tài Khoản MB Bank (VND)', 'bank', 24500000, 'VND', '🏦', '#00f0ff', 'Tài khoản chính nhận lương'),
        ('Tài Khoản Euro / Revolut (EUR)', 'bank', 350.50, 'EUR', '💶', '#ffe600', 'Tài khoản chi tiêu Euro (hỗ trợ cents)'),
        ('Ví PayPal (USD)', 'ewallet', 120.75, 'USD', '💲', '#00bcd4', 'Ví đô la Mỹ thanh toán quốc tế'),
        ('Ví MoMo (VND)', 'ewallet', 1200000, 'VND', '📱', '#ff007f', 'Ví điện tử ăn uống mua sắm'),
        ('Heo Đất Tiết Kiệm (VND)', 'savings', 15000000, 'VND', '🐷', '#bd00ff', 'Quỹ dự phòng khẩn cấp')
    ]
    for name, wtype, init_bal, curr, icon, color, note in default_wallets:
        cursor.execute('''
            INSERT INTO wallets (name, type, initial_balance, currency, icon, color, note)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (name, wtype, init_bal, curr, icon, color, note))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã khôi phục các nguồn tiền mặc định!'})

@app.route('/api/wallets/<int:w_id>/deposit', methods=['POST'])
def deposit_wallet(w_id):
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    amount = float(data.get('amount', 0))
    category_id = data.get('category_id')
    note = data.get('note', 'Nạp tiền vào ví').strip()
    tx_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Số tiền nạp phải lớn hơn 0!'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT name, currency FROM wallets WHERE id = ?', (w_id,))
    wallet = cursor.fetchone()
    if not wallet:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy nguồn tiền!'}), 404
        
    w_curr = wallet['currency'] or 'VND'
    rates = get_exchange_rates(conn)
    amount_vnd = convert_currency(amount, w_curr, 'VND', rates)
    
    if not category_id:
        cursor.execute("SELECT id FROM categories WHERE name = 'Nạp tiền vào ví' LIMIT 1")
        cat = cursor.fetchone()
        if cat:
            category_id = cat['id']
        else:
            cursor.execute("SELECT id FROM categories WHERE type = 'income' LIMIT 1")
            cat2 = cursor.fetchone()
            category_id = cat2['id'] if cat2 else 1
            
    cursor.execute('''
        INSERT INTO transactions (amount, currency, amount_vnd, type, category_id, wallet_id, date, note, payment_method)
        VALUES (?, ?, ?, 'income', ?, ?, ?, ?, ?)
    ''', (amount, w_curr, amount_vnd, category_id, w_id, tx_date, note, wallet['name']))
    
    conn.commit()
    conn.close()
    
    curr_str = f"{amount:.2f} €" if w_curr == 'EUR' else (f"$ {amount:.2f}" if w_curr == 'USD' else f"{amount:,.0f} ₫")
    return jsonify({'success': True, 'message': f'Đã nạp {curr_str} vào nguồn {wallet["name"]}!'})

@app.route('/api/wallets/transfer', methods=['POST'])
def transfer_wallet():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    from_wallet_id = int(data.get('from_wallet_id', 0))
    to_wallet_id = int(data.get('to_wallet_id', 0))
    amount = float(data.get('amount', 0))
    tx_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    note = data.get('note', 'Chuyển tiền giữa các ví').strip()
    
    if from_wallet_id == to_wallet_id:
        return jsonify({'success': False, 'message': 'Nguồn chuyển và nguồn nhận phải khác nhau!'}), 400
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Số tiền chuyển phải lớn hơn 0!'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT currency, name FROM wallets WHERE id = ?', (from_wallet_id,))
    w_from = cursor.fetchone()
    cursor.execute('SELECT currency, name FROM wallets WHERE id = ?', (to_wallet_id,))
    w_to = cursor.fetchone()
    
    rates = get_exchange_rates(conn)
    # If currencies are different, convert amount accurately
    curr_from = w_from['currency'] or 'VND'
    curr_to = w_to['currency'] or 'VND'
    amount_received = convert_currency(amount, curr_from, curr_to, rates)
    
    # Save transfer record
    cursor.execute('''
        INSERT INTO wallet_transfers (from_wallet_id, to_wallet_id, amount, date, note)
        VALUES (?, ?, ?, ?, ?)
    ''', (from_wallet_id, to_wallet_id, amount, tx_date, f"{note} (Quy đổi: {amount} {curr_from} -> {amount_received} {curr_to})"))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Chuyển thành công: {amount} {curr_from} sang {amount_received} {curr_to}!'})

# 3. TRANSACTIONS API
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    period = request.args.get('period', 'month')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category_id = request.args.get('category_id')
    wallet_id = request.args.get('wallet_id')
    tx_type = request.args.get('type')
    tx_currency = request.args.get('currency')
    search = request.args.get('search', '').strip()
    
    if not start_date or not end_date:
        start_date, end_date = get_date_range_bounds(period)
        
    conn = get_db()
    query = '''
        SELECT t.*, 
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               w.name as wallet_name, w.icon as wallet_icon, w.color as wallet_color, w.currency as wallet_curr
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN wallets w ON t.wallet_id = w.id
        WHERE t.date >= ? AND t.date <= ?
    '''
    params = [start_date, end_date]
    
    if category_id:
        query += " AND t.category_id = ?"
        params.append(category_id)
    if wallet_id:
        query += " AND t.wallet_id = ?"
        params.append(wallet_id)
    if tx_type:
        query += " AND t.type = ?"
        params.append(tx_type)
    if tx_currency:
        query += " AND t.currency = ?"
        params.append(tx_currency)
    if search:
        query += " AND (t.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY t.date DESC, t.id DESC"
    
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'transactions': rows, 'start_date': start_date, 'end_date': end_date})

@app.route('/api/transactions', methods=['POST'])
def add_transaction():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'VND').upper()
    tx_type = data.get('type', 'expense')
    category_id = data.get('category_id')
    wallet_id = data.get('wallet_id')
    tx_date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    note = data.get('note', '').strip()
    payment_method = data.get('payment_method', '')
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Số tiền phải lớn hơn 0!'}), 400
    if currency not in ['VND', 'EUR', 'USD']:
        currency = 'VND'
        
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    amount_vnd = convert_currency(amount, currency, 'VND', rates)
    
    if wallet_id and not payment_method:
        cursor.execute("SELECT name FROM wallets WHERE id = ?", (wallet_id,))
        w = cursor.fetchone()
        if w: payment_method = w['name']
    if not payment_method:
        payment_method = 'Tiền mặt'
        
    cursor.execute('''
        INSERT INTO transactions (amount, currency, amount_vnd, type, category_id, wallet_id, date, note, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (amount, currency, amount_vnd, tx_type, category_id, wallet_id, tx_date, note, payment_method))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': new_id, 'message': 'Đã ghi nhận giao dịch thành công!'})

@app.route('/api/transactions/<int:tx_id>', methods=['PUT'])
def update_transaction(tx_id):
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'VND').upper()
    tx_type = data.get('type', 'expense')
    category_id = data.get('category_id')
    wallet_id = data.get('wallet_id')
    tx_date = data.get('date')
    note = data.get('note', '').strip()
    payment_method = data.get('payment_method', 'Tiền mặt')
    
    if amount <= 0:
        return jsonify({'success': False, 'message': 'Số tiền phải lớn hơn 0!'}), 400
    if currency not in ['VND', 'EUR', 'USD']:
        currency = 'VND'
        
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    amount_vnd = convert_currency(amount, currency, 'VND', rates)
    
    cursor.execute('''
        UPDATE transactions
        SET amount = ?, currency = ?, amount_vnd = ?, type = ?, category_id = ?, wallet_id = ?, date = ?, note = ?, payment_method = ?
        WHERE id = ?
    ''', (amount, currency, amount_vnd, tx_type, category_id, wallet_id, tx_date, note, payment_method, tx_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Cập nhật giao dịch thành công!'})

@app.route('/api/transactions/<int:tx_id>', methods=['DELETE'])
def delete_transaction(tx_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM transactions WHERE id = ?', (tx_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa giao dịch!'})

# 4. CATEGORIES API
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM categories ORDER BY type DESC, id ASC')
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'categories': rows})

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', '').strip()
    ctype = data.get('type', 'expense')
    icon = data.get('icon', '🏷️')
    color = data.get('color', '#00f0ff')
    
    if not name:
        return jsonify({'success': False, 'message': 'Tên danh mục không được để trống!'}), 400
        
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)', (name, ctype, icon, color))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': new_id, 'message': 'Thêm danh mục thành công!'})

# 5. SUBSCRIPTIONS & SERVICES API
@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.*, 
               c.name as category_name, c.icon as category_icon, c.color as category_color,
               w.name as wallet_name, w.icon as wallet_icon, w.currency as wallet_curr
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN wallets w ON s.wallet_id = w.id
        ORDER BY s.billing_month ASC, s.billing_day ASC
    ''')
    rows = [dict(r) for r in cursor.fetchall()]
    
    total_monthly_vnd = 0.0
    for item in rows:
        amount_vnd = item['amount_vnd'] or item['amount']
        cycle = item.get('cycle', 'monthly')
        
        if cycle == 'yearly':
            total_monthly_vnd += amount_vnd / 12.0
            b_month = item.get('billing_month') or today.month
            b_day = item.get('billing_day') or 1
            
            _, max_days_this_year = calendar.monthrange(today.year, b_month)
            safe_day_this_year = min(b_day, max_days_this_year)
            this_year_bill = date(today.year, b_month, safe_day_this_year)
            
            if this_year_bill >= today:
                next_bill_date = this_year_bill
            else:
                next_year = today.year + 1
                _, max_days_next_year = calendar.monthrange(next_year, b_month)
                safe_day_next_year = min(b_day, max_days_next_year)
                next_bill_date = date(next_year, b_month, safe_day_next_year)
                
            days_left = (next_bill_date - today).days
        else: # monthly
            total_monthly_vnd += amount_vnd
            bday = min(item.get('billing_day', 1), days_in_month)
            if bday >= today.day:
                days_left = bday - today.day
            else:
                next_month_year = today.year if today.month < 12 else today.year + 1
                next_month = today.month + 1 if today.month < 12 else 1
                _, next_month_max = calendar.monthrange(next_month_year, next_month)
                next_bday = min(item.get('billing_day', 1), next_month_max)
                next_bill_date = date(next_month_year, next_month, next_bday)
                days_left = (next_bill_date - today).days

        item['days_until_bill'] = days_left
        item['is_due_soon'] = days_left <= 3
        
    rates = get_exchange_rates(conn)
    total_monthly_usd = convert_currency(total_monthly_vnd, 'VND', 'USD', rates)
    total_monthly_eur = convert_currency(total_monthly_vnd, 'VND', 'EUR', rates)
    
    conn.close()
    return jsonify({
        'success': True, 
        'subscriptions': rows, 
        'total_monthly_vnd': round(total_monthly_vnd, 0),
        'total_monthly_usd': total_monthly_usd,
        'total_monthly_eur': total_monthly_eur,
        'total_yearly_vnd': round(total_monthly_vnd * 12, 0)
    })

@app.route('/api/subscriptions', methods=['POST'])
def add_subscription():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', '').strip()
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'VND').upper()
    cycle = data.get('cycle', 'monthly')
    billing_day = int(data.get('billing_day', 1))
    billing_month = int(data.get('billing_month', datetime.now().month))
    category_id = data.get('category_id')
    wallet_id = data.get('wallet_id')
    note = data.get('note', '').strip()
    
    if not name or amount <= 0:
        return jsonify({'success': False, 'message': 'Vui lòng nhập tên dịch vụ và số tiền hợp lệ!'}), 400
    if currency not in ['VND', 'EUR', 'USD']:
        currency = 'VND'
    if cycle not in ['monthly', 'yearly']:
        cycle = 'monthly'
        
    rates = get_exchange_rates()
    amount_vnd = convert_currency(amount, currency, 'VND', rates)
    
    billing_day = max(1, min(31, billing_day))
    billing_month = max(1, min(12, billing_month))
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO subscriptions (name, amount, currency, amount_vnd, cycle, billing_day, billing_month, category_id, wallet_id, note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (name, amount, currency, amount_vnd, cycle, billing_day, billing_month, category_id, wallet_id, note))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Đã thêm dịch vụ định kỳ ({currency})!'})

@app.route('/api/subscriptions/<int:sub_id>/pay', methods=['POST'])
def pay_subscription(sub_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.*, w.name as wallet_name 
        FROM subscriptions s
        LEFT JOIN wallets w ON s.wallet_id = w.id
        WHERE s.id = ?
    ''', (sub_id,))
    sub = cursor.fetchone()
    if not sub:
        conn.close()
        return jsonify({'success': False, 'message': 'Không tìm thấy dịch vụ!'}), 404
        
    today_str = date.today().strftime('%Y-%m-%d')
    note = f"Thanh toán dịch vụ: {sub['name']}"
    pay_method = sub['wallet_name'] or 'Ngân hàng'
    rates = get_exchange_rates(conn)
    curr = sub['currency'] or 'VND'
    amt_vnd = convert_currency(sub['amount'], curr, 'VND', rates)
    
    cursor.execute('''
        INSERT INTO transactions (amount, currency, amount_vnd, type, category_id, wallet_id, date, note, payment_method)
        VALUES (?, ?, ?, 'expense', ?, ?, ?, ?, ?)
    ''', (sub['amount'], curr, amt_vnd, sub['category_id'], sub['wallet_id'], today_str, note, pay_method))
    
    cursor.execute('UPDATE subscriptions SET last_billed_date = ? WHERE id = ?', (today_str, sub_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': f'Đã ghi nhận thanh toán {sub["name"]} vào chi tiêu hôm nay!'})

@app.route('/api/subscriptions/<int:sub_id>', methods=['GET'])
def get_subscription_detail(sub_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.*, 
               c.name as category_name, c.icon as category_icon,
               w.name as wallet_name, w.icon as wallet_icon, w.currency as wallet_curr
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN wallets w ON s.wallet_id = w.id
        WHERE s.id = ?
    ''', (sub_id,))
    sub = cursor.fetchone()
    conn.close()
    if not sub:
        return jsonify({'success': False, 'message': 'Không tìm thấy dịch vụ!'}), 404
    return jsonify({'success': True, 'subscription': dict(sub)})

@app.route('/api/subscriptions/<int:sub_id>', methods=['PUT'])
def update_subscription(sub_id):
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    name = data.get('name', '').strip()
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'VND').upper()
    cycle = data.get('cycle', 'monthly')
    billing_day = int(data.get('billing_day', 1))
    billing_month = int(data.get('billing_month', datetime.now().month))
    category_id = data.get('category_id')
    wallet_id = data.get('wallet_id')
    note = data.get('note', '').strip()
    
    if not name or amount <= 0:
        return jsonify({'success': False, 'message': 'Vui lòng nhập tên dịch vụ và số tiền hợp lệ!'}), 400
    if currency not in ['VND', 'EUR', 'USD']:
        currency = 'VND'
    if cycle not in ['monthly', 'yearly']:
        cycle = 'monthly'
        
    rates = get_exchange_rates()
    amount_vnd = convert_currency(amount, currency, 'VND', rates)
    
    billing_day = max(1, min(31, billing_day))
    billing_month = max(1, min(12, billing_month))
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE subscriptions 
        SET name = ?, amount = ?, currency = ?, amount_vnd = ?, cycle = ?, billing_day = ?, billing_month = ?, category_id = ?, wallet_id = ?, note = ?
        WHERE id = ?
    ''', (name, amount, currency, amount_vnd, cycle, billing_day, billing_month, category_id, wallet_id, note, sub_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã cập nhật dịch vụ định kỳ thành công!'})

@app.route('/api/subscriptions/<int:sub_id>', methods=['DELETE'])
def delete_subscription(sub_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM subscriptions WHERE id = ?', (sub_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã xóa dịch vụ!'})

# 6. SMART BUDGET & REASONABLE SPENDING LIMITS API
@app.route('/api/budget/recommendation', methods=['GET'])
def get_budget_recommendation():
    today = date.today()
    year = today.year
    month = today.month
    day = today.day
    _, days_in_month = calendar.monthrange(year, month)
    days_left_in_month = days_in_month - day + 1
    
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    
    cursor.execute("SELECT * FROM budgets WHERE month_year = 'default' LIMIT 1")
    budget_row = cursor.fetchone()
    if not budget_row:
        income_type = 'variable'
        runway_target_months = 6.0
        monthly_budget = 15000000.0
        expected_income = 0.0
        savings_target_pct = 25.0
    else:
        b_dict = dict(budget_row)
        income_type = b_dict.get('income_type') or 'variable'
        runway_target_months = float(b_dict.get('runway_target_months') or 6.0)
        monthly_budget = float(b_dict.get('monthly_budget', 15000000.0))
        expected_income = float(b_dict.get('expected_income', 0.0))
        savings_target_pct = float(b_dict.get('savings_target_pct', 25.0))
        
    cursor.execute('''
        SELECT SUM(
            CASE WHEN cycle = 'monthly' THEN amount_vnd
                 WHEN cycle = 'yearly' THEN amount_vnd / 12.0
                 ELSE amount_vnd END
        ) as total_sub
        FROM subscriptions WHERE is_active = 1
    ''')
    sub_res = cursor.fetchone()
    fixed_subscriptions = float(sub_res['total_sub'] or 0.0)
    
    start_month = f"{year}-{month:02d}-01"
    end_month = f"{year}-{month:02d}-{days_in_month:02d}"
    
    cursor.execute('''
        SELECT 
            SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as total_expense,
            SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as total_income
        FROM transactions
        WHERE date >= ? AND date <= ?
    ''', (start_month, end_month))
    m_res = cursor.fetchone()
    actual_month_expense = float(m_res['total_expense'] or 0.0)
    actual_month_income = float(m_res['total_income'] or 0.0)
    
    today_str = today.strftime('%Y-%m-%d')
    cursor.execute('''
        SELECT SUM(amount_vnd) as today_expense
        FROM transactions
        WHERE type = 'expense' AND date = ?
    ''', (today_str,))
    today_res = cursor.fetchone()
    actual_today_expense = float(today_res['today_expense'] or 0.0)
    
    start_week = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
    end_week = (today + timedelta(days=6 - today.weekday())).strftime('%Y-%m-%d')
    cursor.execute('''
        SELECT SUM(amount_vnd) as week_expense
        FROM transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
    ''', (start_week, end_week))
    week_res = cursor.fetchone()
    actual_week_expense = float(week_res['week_expense'] or 0.0)
    
    start_year = f"{year}-01-01"
    end_year = f"{year}-12-31"
    cursor.execute('''
        SELECT SUM(amount_vnd) as year_expense
        FROM transactions
        WHERE type = 'expense' AND date >= ? AND date <= ?
    ''', (start_year, end_year))
    year_res = cursor.fetchone()
    actual_year_expense = float(year_res['year_expense'] or 0.0)
    
    # Calculate unpaid fixed subscriptions for this current month
    cursor.execute('''
        SELECT amount_vnd, cycle, billing_day, billing_month, last_billed_date
        FROM subscriptions WHERE is_active = 1
    ''')
    active_subs = cursor.fetchall()
    
    unpaid_subs_month = 0.0
    for s in active_subs:
        last_billed = s['last_billed_date'] or ''
        billed_this_month = last_billed.startswith(f"{year}-{month:02d}")
        if not billed_this_month:
            cycle = s['cycle']
            if cycle == 'monthly':
                unpaid_subs_month += float(s['amount_vnd'] or 0.0)
            elif cycle == 'yearly':
                b_month = s['billing_month'] or 1
                if b_month == month:
                    unpaid_subs_month += float(s['amount_vnd'] or 0.0)
                else:
                    unpaid_subs_month += float(s['amount_vnd'] or 0.0) / 12.0

    conn.close()
    
    # Total liquid assets in all wallets
    wallets = calculate_wallet_balances()
    total_assets_vnd = sum(w['balance_vnd'] for w in wallets)
    
    # Monthly burn rate baseline:
    monthly_burn = max(monthly_budget, fixed_subscriptions) if monthly_budget > 0 else max(10000000.0, fixed_subscriptions)
    runway_months = round(total_assets_vnd / max(monthly_burn, 1000000.0), 1) if total_assets_vnd > 0 else 0.0

    days_left_in_week = max(1, 7 - today.weekday())
    base_daily_budget = round(monthly_burn / days_in_month, 0)
    base_weekly_budget = round(monthly_burn / (days_in_month / 7.0), 0)

    # Asset Allocation Calculation
    emergency_target_vnd = monthly_burn * runway_target_months
    emergency_pct = round(min(100.0, (total_assets_vnd / max(emergency_target_vnd, 1.0)) * 100.0), 1) if total_assets_vnd > 0 else 0.0
    free_capital_vnd = max(0.0, total_assets_vnd - emergency_target_vnd)

    if income_type == 'variable':
        # === VARIABLE / UNSTABLE INCOME EVALUATION (RUNWAY & LIQUID ASSET BUFFER) ===
        # Health HP is evaluated on the survival runway ratio
        runway_ratio = runway_months / max(runway_target_months, 1.0)
        if runway_ratio >= 2.0:
            hp_percent = 100
        elif runway_ratio >= 1.0:
            hp_percent = min(99, int(85 + (runway_ratio - 1.0) * 14))
        elif runway_ratio >= 0.5:
            hp_percent = int(65 + (runway_ratio - 0.5) / 0.5 * 20)
        elif runway_ratio >= 0.25:
            hp_percent = int(40 + (runway_ratio - 0.25) / 0.25 * 24)
        else:
            hp_percent = max(10, int(runway_ratio / 0.25 * 39))

        # Reward surplus cashflow if income arrived this month
        if actual_month_income > actual_month_expense and actual_month_income > 0:
            hp_percent = min(100, hp_percent + 5)

        # Spending limits for variable income:
        # Augment allowed budget with any real income arrived this month
        effective_month_budget = monthly_burn + actual_month_income
        remaining_month_gross = effective_month_budget - actual_month_expense
        remaining_month_safe = max(0.0, remaining_month_gross - unpaid_subs_month)

        if remaining_month_safe > 0 and days_left_in_month > 0:
            recommended_safe_daily = round(remaining_month_safe / days_left_in_month, 0)
        else:
            # Fallback daily pace from emergency fund if this month's budget ceiling was reached
            recommended_safe_daily = round(total_assets_vnd / (runway_target_months * 30.0), 0) if total_assets_vnd > 0 else 0.0

        today_remaining_daily = max(0.0, recommended_safe_daily - actual_today_expense)
        today_overspent_daily = max(0.0, actual_today_expense - recommended_safe_daily)
        remaining_weekly = max(0.0, min(remaining_month_safe, recommended_safe_daily * days_left_in_week))

        # NPC Advice tailored for Freelancers / Variable Income
        if hp_percent >= 85:
            status_level = "excellent"
            npc_avatar = "🛡️"
            advice_title = "QUỸ DỰ TRỮ CỰC KỲ VỮNG VÀNG!"
            if today_remaining_daily > 0:
                advice_text = f"Tài sản khả dụng ({total_assets_vnd:,.0f} ₫) đủ bảo đảm sinh tồn trong {runway_months} tháng (vượt xa mục tiêu {runway_target_months:,.0f} tháng). Hôm nay còn {today_remaining_daily:,.0f} ₫ trong mức an toàn!"
            else:
                advice_text = f"Tài sản hiện có bảo đảm an toàn {runway_months} tháng. Hôm nay bạn đã chi {actual_today_expense:,.0f} ₫ (vượt định mức ngày {recommended_safe_daily:,.0f} ₫), hãy tiết chế ngày mai nhé!"
        elif hp_percent >= 65:
            status_level = "safe"
            npc_avatar = "⚔️"
            advice_title = "TÀI CHÍNH ỔN ĐỊNH"
            advice_text = f"Quỹ dự phòng duy trì được {runway_months} tháng (Mục tiêu: {runway_target_months:,.0f} tháng). Hôm nay nên chi tối đa {today_remaining_daily:,.0f} ₫ ({today_remaining_daily/rates['EUR_VND']:.2f} €) để bảo vệ quỹ sinh tồn."
        elif hp_percent >= 40:
            status_level = "warning"
            npc_avatar = "⚠️"
            advice_title = "CẦN CHÚ Ý TIẾT KIỆM"
            advice_text = f"Quỹ sinh tồn còn {runway_months} tháng (Thấp hơn mục tiêu {runway_target_months:,.0f} tháng). Hãy thắt chặt chi tiêu và ưu tiên tạo thêm dòng tiền thu nhập mới."
        else:
            status_level = "danger"
            npc_avatar = "💀"
            advice_title = "BÁO ĐỘNG QUỸ DỰ TRỮ!"
            advice_text = f"Cảnh báo: Tài sản chỉ còn đủ duy trì trong {runway_months} tháng! Cần dừng ngay các khoản chi ngoài lề và cắt giảm tối đa chi phí sinh hoạt."

        rule_needs = monthly_burn * 0.50
        rule_wants = monthly_burn * 0.30
        rule_savings = monthly_burn * 0.20

    else:
        # === FIXED SALARY / REGULAR INCOME MODE ===
        remaining_month_gross = monthly_budget - actual_month_expense
        remaining_month_safe = max(0.0, remaining_month_gross - unpaid_subs_month)

        if remaining_month_safe > 0 and days_left_in_month > 0:
            recommended_safe_daily = round(remaining_month_safe / days_left_in_month, 0)
        else:
            recommended_safe_daily = 0.0

        today_remaining_daily = max(0.0, recommended_safe_daily - actual_today_expense)
        today_overspent_daily = max(0.0, actual_today_expense - recommended_safe_daily)
        remaining_weekly = max(0.0, min(remaining_month_safe, base_weekly_budget - actual_week_expense))

        variable_ceiling = max(1.0, monthly_budget - fixed_subscriptions)
        hp_percent = max(0, min(100, int((remaining_month_safe / variable_ceiling) * 100)))

        income_base = expected_income if expected_income > 0 else (monthly_budget / 0.75)
        rule_savings = round(income_base * (savings_target_pct / 100.0), 0)
        rule_needs = round(income_base * 0.50, 0)
        rule_wants = round(max(0.0, income_base - rule_needs - rule_savings), 0)

        if remaining_month_safe <= 0 or hp_percent < 20:
            status_level = "danger"
            npc_avatar = "💀"
            advice_title = "BÁO ĐỘNG NGÂN SÁCH!"
            advice_text = f"Cảnh báo: Bạn chỉ còn {remaining_month_safe:,.0f} ₫ cho {days_left_in_month} ngày còn lại. Cần dừng mọi chi tiêu tùy ý!"
        elif actual_today_expense > recommended_safe_daily and recommended_safe_daily > 0:
            status_level = "warning"
            npc_avatar = "⚔️"
            advice_title = "VƯỢT HẠN MỨC HÔM NAY"
            advice_text = f"Hôm nay bạn đã chi {actual_today_expense:,.0f} ₫ (vượt {today_overspent_daily:,.0f} ₫ định mức ngày). Hãy tiết chế cho các ngày tới nhé!"
        elif hp_percent > 65:
            status_level = "excellent"
            npc_avatar = "🛡️"
            advice_title = "CHI TIÊU RẤT AN TOÀN!"
            advice_text = f"Hôm nay còn {today_remaining_daily:,.0f} ₫ trong hạn mức an toàn {recommended_safe_daily:,.0f} ₫. Tiếp tục giữ vững phong độ nhé!"
        else:
            status_level = "warning"
            npc_avatar = "⚔️"
            advice_title = "CẦN CHÚ Ý CHI TIÊU"
            advice_text = f"Hôm nay nên chi trong khoảng {today_remaining_daily:,.0f} ₫ ({today_remaining_daily/rates['EUR_VND']:.2f} €) để đảm bảo không chạm đáy ngân sách."

    return jsonify({
        'success': True,
        'current_date': today_str,
        'days_in_month': days_in_month,
        'day_of_month': day,
        'days_left_in_month': days_left_in_month,
        'settings': {
            'income_type': income_type,
            'runway_target_months': runway_target_months,
            'expected_income': expected_income,
            'monthly_budget': monthly_budget,
            'monthly_burn': monthly_burn,
            'savings_target_pct': savings_target_pct,
            'fixed_subscriptions': fixed_subscriptions,
            'unpaid_subs_month': unpaid_subs_month,
            'total_assets_vnd': total_assets_vnd
        },
        'actuals': {
            'today_expense_vnd': actual_today_expense,
            'week_expense_vnd': actual_week_expense,
            'month_expense_vnd': actual_month_expense,
            'month_income_vnd': actual_month_income,
            'year_expense_vnd': actual_year_expense,
            'net_month_cashflow_vnd': actual_month_income - actual_month_expense
        },
        'recommendations': {
            'safe_daily_vnd': recommended_safe_daily,
            'today_remaining_vnd': today_remaining_daily,
            'today_overspent_vnd': today_overspent_daily,
            'safe_daily_usd': round(recommended_safe_daily / rates['USD_VND'], 2),
            'safe_daily_eur': round(recommended_safe_daily / rates['EUR_VND'], 2),
            'base_daily_vnd': base_daily_budget,
            'weekly_target_vnd': base_weekly_budget,
            'monthly_target_vnd': monthly_budget,
            'remaining_month_vnd': remaining_month_safe,
            'remaining_month_gross_vnd': remaining_month_gross,
            'remaining_weekly_vnd': remaining_weekly,
            'runway_months': runway_months,
            'runway_target_months': runway_target_months,
            'asset_allocation': {
                'total_assets_vnd': total_assets_vnd,
                'emergency_target_vnd': emergency_target_vnd,
                'emergency_pct': emergency_pct,
                'free_capital_vnd': free_capital_vnd
            },
            'rule_50_30_20': {
                'needs': rule_needs,
                'wants': rule_wants,
                'savings': rule_savings
            }
        },
        'health': {
            'hp_percent': hp_percent,
            'status_level': status_level,
            'npc_avatar': npc_avatar,
            'advice_title': advice_title,
            'advice_text': advice_text,
            'runway_months': runway_months,
            'runway_target_months': runway_target_months,
            'runway_badge_text': f"🛡️ Dự trữ: {runway_months} tháng" if income_type == 'variable' else f"❤️ {hp_percent} HP",
            'evaluation_mode': income_type
        }
    })

@app.route('/api/budget/settings', methods=['POST'])
def save_budget_settings():
    data = request.get_json(silent=True) or request.form.to_dict() or {}
    income_type = data.get('income_type', 'variable')
    if income_type not in ['variable', 'fixed']:
        income_type = 'variable'
    runway_target_months = float(data.get('runway_target_months', 6.0))
    expected_income = float(data.get('expected_income', 0))
    monthly_budget = float(data.get('monthly_budget', 15000000))
    savings_target_pct = float(data.get('savings_target_pct', 25))
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE budgets 
        SET income_type = ?, runway_target_months = ?, expected_income = ?, monthly_budget = ?, savings_target_pct = ?
        WHERE month_year = 'default'
    ''', (income_type, runway_target_months, expected_income, monthly_budget, savings_target_pct))
    if cursor.rowcount == 0:
        cursor.execute('''
            INSERT INTO budgets (month_year, income_type, runway_target_months, expected_income, monthly_budget, savings_target_pct)
            VALUES ('default', ?, ?, ?, ?, ?)
        ''', (income_type, runway_target_months, expected_income, monthly_budget, savings_target_pct))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Đã lưu thiết lập ngân sách thành công!'})

# 7. CHARTS & STATISTICS ANALYTICS API
@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    period = request.args.get('period', 'month')
    start_date, end_date = get_date_range_bounds(period)
    
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    
    cursor.execute('''
        SELECT 
            SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as total_expense_vnd,
            SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as total_income_vnd,
            COUNT(*) as tx_count
        FROM transactions
        WHERE date >= ? AND date <= ?
    ''', (start_date, end_date))
    kpi_res = cursor.fetchone()
    total_expense_vnd = float(kpi_res['total_expense_vnd'] or 0)
    total_income_vnd = float(kpi_res['total_income_vnd'] or 0)
    tx_count = int(kpi_res['tx_count'] or 0)
    balance_vnd = total_income_vnd - total_expense_vnd
    
    cursor.execute('''
        SELECT 
            c.id, c.name, c.icon, c.color,
            SUM(t.amount_vnd) as amount_vnd,
            COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND t.date >= ? AND t.date <= ?
        GROUP BY c.id
        ORDER BY amount_vnd DESC
    ''', (start_date, end_date))
    categories_raw = [dict(r) for r in cursor.fetchall()]
    
    category_labels = []
    category_data = []
    category_colors = []
    category_breakdown = []
    for item in categories_raw:
        pct = round((item['amount_vnd'] / total_expense_vnd * 100), 1) if total_expense_vnd > 0 else 0
        item['percentage'] = pct
        category_breakdown.append(item)
        category_labels.append(f"{item['icon']} {item['name']}")
        category_data.append(item['amount_vnd'])
        category_colors.append(item['color'])
        
    timeline_labels = []
    timeline_expense = []
    timeline_income = []
    
    if period in ['day', 'week']:
        w_start = datetime.strptime(start_date, '%Y-%m-%d').date()
        day_names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        for i in range(7):
            cur_d = (w_start + timedelta(days=i)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as exp,
                    SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as inc
                FROM transactions WHERE date = ?
            ''', (cur_d,))
            r = cursor.fetchone()
            timeline_labels.append(f"{day_names[i]} ({cur_d[8:10]}/{cur_d[5:7]})")
            timeline_expense.append(float(r['exp'] or 0))
            timeline_income.append(float(r['inc'] or 0))
            
    elif period == 'month':
        y, m, _ = [int(x) for x in start_date.split('-')]
        _, num_days = calendar.monthrange(y, m)
        for d in range(1, num_days + 1):
            cur_d = f"{y}-{m:02d}-{d:02d}"
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as exp,
                    SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as inc
                FROM transactions WHERE date = ?
            ''', (cur_d,))
            r = cursor.fetchone()
            timeline_labels.append(f"Ngày {d:02d}")
            timeline_expense.append(float(r['exp'] or 0))
            timeline_income.append(float(r['inc'] or 0))
            
    elif period == 'year':
        y = int(start_date.split('-')[0])
        for m in range(1, 13):
            m_start = f"{y}-{m:02d}-01"
            _, l_day = calendar.monthrange(y, m)
            m_end = f"{y}-{m:02d}-{l_day:02d}"
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as exp,
                    SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as inc
                FROM transactions WHERE date >= ? AND date <= ?
            ''', (m_start, m_end))
            r = cursor.fetchone()
            timeline_labels.append(f"Tháng {m}")
            timeline_expense.append(float(r['exp'] or 0))
            timeline_income.append(float(r['inc'] or 0))
    else: # all
        today = date.today()
        for i in range(5, -1, -1):
            target_month_date = today.replace(day=1) - timedelta(days=i*30)
            y = target_month_date.year
            m = target_month_date.month
            m_start = f"{y}-{m:02d}-01"
            _, l_day = calendar.monthrange(y, m)
            m_end = f"{y}-{m:02d}-{l_day:02d}"
            cursor.execute('''
                SELECT 
                    SUM(CASE WHEN type = 'expense' THEN amount_vnd ELSE 0 END) as exp,
                    SUM(CASE WHEN type = 'income' THEN amount_vnd ELSE 0 END) as inc
                FROM transactions WHERE date >= ? AND date <= ?
            ''', (m_start, m_end))
            r = cursor.fetchone()
            timeline_labels.append(f"T{m}/{y}")
            timeline_expense.append(float(r['exp'] or 0))
            timeline_income.append(float(r['inc'] or 0))
            
    cursor.execute('''
        SELECT t.*, c.name as category_name, c.icon as category_icon, w.name as wallet_name
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN wallets w ON t.wallet_id = w.id
        WHERE t.type = 'expense' AND t.date >= ? AND t.date <= ?
        ORDER BY t.amount_vnd DESC
        LIMIT 5
    ''', (start_date, end_date))
    top_expenses = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'period': period,
        'start_date': start_date,
        'end_date': end_date,
        'rates': rates,
        'kpi': {
            'total_expense_vnd': total_expense_vnd,
            'total_expense_usd': round(total_expense_vnd / rates['USD_VND'], 2),
            'total_expense_eur': round(total_expense_vnd / rates['EUR_VND'], 2),
            'total_income_vnd': total_income_vnd,
            'total_income_usd': round(total_income_vnd / rates['USD_VND'], 2),
            'total_income_eur': round(total_income_vnd / rates['EUR_VND'], 2),
            'balance_vnd': balance_vnd,
            'balance_usd': round(balance_vnd / rates['USD_VND'], 2),
            'balance_eur': round(balance_vnd / rates['EUR_VND'], 2),
            'tx_count': tx_count
        },
        'category_chart': {
            'labels': category_labels,
            'data': category_data,
            'colors': category_colors,
            'breakdown': category_breakdown
        },
        'timeline_chart': {
            'labels': timeline_labels,
            'expense': timeline_expense,
            'income': timeline_income
        },
        'top_expenses': top_expenses
    })

# 8. HIGH-END MULTI-SHEET VISUAL EXCEL EXPORT (WITH EUR, USD & VND FORMATTING)
@app.route('/api/export/excel', methods=['GET'])
def export_excel():
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    
    # 1. Transactions
    cursor.execute('''
        SELECT t.id, t.date, t.type, c.name as category, w.name as wallet_name,
               t.amount, t.currency, t.amount_vnd, t.payment_method, t.note
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN wallets w ON t.wallet_id = w.id
        ORDER BY t.date DESC, t.id DESC
    ''')
    transactions = [dict(t) for t in cursor.fetchall()]
    
    # 2. Category totals
    cursor.execute('''
        SELECT c.name as category, 
               SUM(CASE WHEN t.type = 'expense' THEN t.amount_vnd ELSE 0 END) as expense_vnd,
               COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        GROUP BY c.id
        ORDER BY expense_vnd DESC
    ''')
    category_summary = [dict(c) for c in cursor.fetchall()]
    
    # 3. Subscriptions
    cursor.execute('''
        SELECT s.name, s.amount, s.currency, s.amount_vnd, s.cycle, s.billing_day, s.billing_month, c.name as category, w.name as wallet_name, s.note
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN wallets w ON s.wallet_id = w.id
        ORDER BY s.billing_month ASC, s.billing_day ASC
    ''')
    subscriptions = [dict(s) for s in cursor.fetchall()]
    
    # 4. Wallets
    wallets = calculate_wallet_balances()
    total_assets_vnd = sum(w['balance_vnd'] for w in wallets)
    
    # Totals in VND
    total_expense_vnd = sum(t['amount_vnd'] for t in transactions if t['type'] == 'expense')
    total_income_vnd = sum(t['amount_vnd'] for t in transactions if t['type'] == 'income')
    balance_vnd = total_income_vnd - total_expense_vnd
    
    conn.close()
    
    # STYLES SETUP
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    
    title_font = Font(name='Segoe UI', size=16, bold=True, color='FFFFFF')
    sub_title_font = Font(name='Segoe UI', size=10, italic=True, color='D1D5DB')
    card_title_font = Font(name='Segoe UI', size=9, bold=True, color='6B7280')
    card_value_font = Font(name='Segoe UI', size=14, bold=True, color='111827')
    table_hdr_font = Font(name='Segoe UI', size=11, bold=True, color='FFFFFF')
    regular_font = Font(name='Segoe UI', size=10, color='1F2937')
    bold_font = Font(name='Segoe UI', size=10, bold=True, color='111827')
    income_font = Font(name='Segoe UI', size=10, bold=True, color='059669')
    expense_font = Font(name='Segoe UI', size=10, bold=True, color='DC2626')
    
    banner_fill = PatternFill(start_color='1E1B4B', end_color='1E1B4B', fill_type='solid')
    header_navy_fill = PatternFill(start_color='312E81', end_color='312E81', fill_type='solid')
    header_accent_fill = PatternFill(start_color='4F46E5', end_color='4F46E5', fill_type='solid')
    card_bg_fill = PatternFill(start_color='F3F4F6', end_color='F3F4F6', fill_type='solid')
    zebra_fill = PatternFill(start_color='F9FAFB', end_color='F9FAFB', fill_type='solid')
    income_row_fill = PatternFill(start_color='ECFDF5', end_color='ECFDF5', fill_type='solid')
    expense_row_fill = PatternFill(start_color='FEF2F2', end_color='FEF2F2', fill_type='solid')
    total_row_fill = PatternFill(start_color='EEF2FF', end_color='EEF2FF', fill_type='solid')
    
    thin_border = Border(
        left=Side(style='thin', color='E5E7EB'),
        right=Side(style='thin', color='E5E7EB'),
        top=Side(style='thin', color='E5E7EB'),
        bottom=Side(style='thin', color='E5E7EB')
    )
    double_bottom_border = Border(
        left=Side(style='thin', color='D1D5DB'),
        right=Side(style='thin', color='D1D5DB'),
        top=Side(style='thin', color='D1D5DB'),
        bottom=Side(style='double', color='111827')
    )
    card_border = Border(
        left=Side(style='medium', color='CBD5E1'),
        right=Side(style='medium', color='CBD5E1'),
        top=Side(style='medium', color='CBD5E1'),
        bottom=Side(style='medium', color='CBD5E1')
    )
    
    center_align = Alignment(horizontal='center', vertical='center')
    left_align = Alignment(horizontal='left', vertical='center')
    right_align = Alignment(horizontal='right', vertical='center')
    
    # SHEET 1: DASHBOARD
    ws1 = wb.create_sheet(title="📊 Tổng Quan & Thống Kê")
    ws1.views.sheetView[0].showGridLines = True
    
    ws1.merge_cells('B2:H3')
    banner_cell = ws1['B2']
    banner_cell.value = "🪙 BÁO CÁO TÀI CHÍNH ĐA TIỀN TỆ (EUR • USD • VNĐ)"
    banner_cell.font = title_font
    banner_cell.fill = banner_fill
    banner_cell.alignment = center_align
    
    ws1['B4'].value = f"Tỷ giá: 1 EUR = {rates['EUR_VND']:,.0f} ₫ • 1 USD = {rates['USD_VND']:,.0f} ₫ | Xuất lúc: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    ws1['B4'].font = sub_title_font
    ws1['B4'].fill = banner_fill
    ws1.merge_cells('B4:H4')
    ws1['B4'].alignment = center_align
    
    # KPI Row 6-8
    kpis = [
        ('B', 'TỔNG TÀI SẢN (VNĐ)', total_assets_vnd, '4F46E5', '#,##0 "₫"'),
        ('C', 'QUY ĐỔI EUR (€)', total_assets_vnd / rates['EUR_VND'], 'D97706', '#,##0.00 "€"'),
        ('D', 'QUY ĐỔI USD ($)', total_assets_vnd / rates['USD_VND'], '2563EB', '"$"#,##0.00'),
        ('E', 'TỔNG THU NHẬP', total_income_vnd, '059669', '#,##0 "₫"'),
        ('F', 'TỔNG CHI TIÊU', total_expense_vnd, 'DC2626', '#,##0 "₫"'),
        ('G', 'SỐ DƯ DÒNG TIỀN', balance_vnd, '7C3AED', '#,##0 "₫"')
    ]
    for col, title, val, col_hex, num_fmt in kpis:
        c_title = ws1[f"{col}6"]
        c_title.value = title
        c_title.font = card_title_font
        c_val = ws1[f"{col}7"]
        c_val.value = val
        c_val.font = Font(name='Segoe UI', size=13, bold=True, color=col_hex)
        c_val.number_format = num_fmt
        for r in [6, 7]:
            cell = ws1[f"{col}{r}"]
            cell.fill = card_bg_fill
            cell.border = card_border
            cell.alignment = center_align
            
    # Table 1: Wallets with native currency and cents support
    ws1['B10'].value = "💼 DANH SÁCH NGUỒN TIỀN / VÍ (ĐA TIỀN TỆ)"
    ws1['B10'].font = Font(name='Segoe UI', size=12, bold=True, color='1E1B4B')
    
    w_headers = ["Nguồn Tiền / Ví", "Loại", "Tiền Tệ", "Số Dư Gốc (Native)", "Quy Đổi VNĐ"]
    for i, h in enumerate(w_headers, start=2):
        cell = ws1.cell(row=11, column=i, value=h)
        cell.font = table_hdr_font
        cell.fill = header_navy_fill
        cell.alignment = center_align
        
    curr_r = 12
    for w in wallets:
        w_curr = w.get('currency', 'VND')
        ws1.cell(row=curr_r, column=2, value=f"{w['icon']} {w['name']}").font = bold_font
        ws1.cell(row=curr_r, column=3, value=w['type'].upper()).alignment = center_align
        ws1.cell(row=curr_r, column=4, value=w_curr).alignment = center_align
        
        c_bal = ws1.cell(row=curr_r, column=5, value=w['current_balance'])
        if w_curr == 'EUR':
            c_bal.number_format = '#,##0.00 "€"'
        elif w_curr == 'USD':
            c_bal.number_format = '"$"#,##0.00'
        else:
            c_bal.number_format = '#,##0 "₫"'
        c_bal.alignment = right_align
        c_bal.font = bold_font
        
        c_vnd = ws1.cell(row=curr_r, column=6, value=w['balance_vnd'])
        c_vnd.number_format = '#,##0 "₫"'
        c_vnd.alignment = right_align
        
        for col_idx in range(2, 7):
            cell = ws1.cell(row=curr_r, column=col_idx)
            cell.border = thin_border
            if curr_r % 2 == 1: cell.fill = zebra_fill
        curr_r += 1
        
    ws1.cell(row=curr_r, column=2, value="TỔNG TÀI SẢN KHẢ DỤNG").font = bold_font
    ws1.cell(row=curr_r, column=6, value=f"=SUM(F12:F{curr_r-1})").font = bold_font
    ws1.cell(row=curr_r, column=6).number_format = '#,##0 "₫"'
    ws1.cell(row=curr_r, column=6).alignment = right_align
    for col_idx in range(2, 7):
        c = ws1.cell(row=curr_r, column=col_idx)
        c.fill = total_row_fill
        c.border = double_bottom_border
        
    # Table 2: Categories
    curr_r += 3
    ws1.cell(row=curr_r, column=2, value="🍩 PHÂN BỔ CHI TIÊU THEO DANH MỤC").font = Font(name='Segoe UI', size=12, bold=True, color='1E1B4B')
    
    cat_headers = ["Danh Mục", "Tổng Chi (VNĐ)", "Tỷ Trọng (%)", "Số Lần Chi"]
    curr_r += 1
    for i, h in enumerate(cat_headers, start=2):
        cell = ws1.cell(row=curr_r, column=i, value=h)
        cell.font = table_hdr_font
        cell.fill = header_accent_fill
        cell.alignment = center_align
        
    curr_r += 1
    cat_start = curr_r
    for item in category_summary:
        if item['expense_vnd'] > 0:
            pct = (item['expense_vnd'] / total_expense_vnd) if total_expense_vnd > 0 else 0
            ws1.cell(row=curr_r, column=2, value=item['category']).font = regular_font
            
            c_amt = ws1.cell(row=curr_r, column=3, value=item['expense_vnd'])
            c_amt.number_format = '#,##0 "₫"'
            c_amt.alignment = right_align
            
            c_pct = ws1.cell(row=curr_r, column=4, value=pct)
            c_pct.number_format = '0.0%'
            c_pct.alignment = right_align
            
            ws1.cell(row=curr_r, column=5, value=item['count']).alignment = center_align
            
            for col_idx in range(2, 6):
                cell = ws1.cell(row=curr_r, column=col_idx)
                cell.border = thin_border
                if curr_r % 2 == 1: cell.fill = zebra_fill
            curr_r += 1
            
    for col in ws1.columns:
        col_letter = get_column_letter(col[0].column)
        if col_letter == 'A': ws1.column_dimensions[col_letter].width = 3
        else:
            max_len = max(len(str(c.value or '')) for c in col)
            ws1.column_dimensions[col_letter].width = max(max_len + 4, 18)

    # SHEET 2: TRANSACTIONS
    ws2 = wb.create_sheet(title="📜 Sổ Thu Chi Chi Tiết")
    ws2.views.sheetView[0].showGridLines = True
    
    ws2['A1'].value = "SỔ GHI CHÉP GIAO DỊCH THU CHI ĐA TIỀN TỆ"
    ws2['A1'].font = Font(name='Segoe UI', size=14, bold=True, color='1E1B4B')
    ws2['A2'].value = f"Đơn vị gốc: EUR (có cents), USD (có cents), VNĐ | Dữ liệu cập nhật: {datetime.now().strftime('%d/%m/%Y %H:%M')}"
    ws2['A2'].font = sub_title_font
    
    tx_headers = ["Mã GD", "Ngày", "Loại", "Danh Mục", "Nguồn Tiền / Ví", "Số Tiền Gốc", "Tiền Tệ", "Quy Đổi (VNĐ)", "Ghi Chú"]
    for i, h in enumerate(tx_headers, start=1):
        cell = ws2.cell(row=4, column=i, value=h)
        cell.font = table_hdr_font
        cell.fill = header_navy_fill
        cell.alignment = center_align
        
    tx_row = 5
    for t in transactions:
        is_inc = t['type'] == 'income'
        t_curr = (dict(t).get('currency') or 'VND')
        
        ws2.cell(row=tx_row, column=1, value=t['id']).alignment = center_align
        ws2.cell(row=tx_row, column=2, value=t['date']).alignment = center_align
        
        c_type = ws2.cell(row=tx_row, column=3, value="Thu nhập" if is_inc else "Chi tiêu")
        c_type.alignment = center_align
        c_type.font = income_font if is_inc else expense_font
        
        ws2.cell(row=tx_row, column=4, value=t['category'] or 'Chưa phân loại')
        ws2.cell(row=tx_row, column=5, value=t['wallet_name'] or 'Tiền mặt').alignment = center_align
        
        # Native amount with proper currency and decimals
        c_amt = ws2.cell(row=tx_row, column=6, value=t['amount'])
        if t_curr == 'EUR':
            c_amt.number_format = '#,##0.00 "€"'
        elif t_curr == 'USD':
            c_amt.number_format = '"$"#,##0.00'
        else:
            c_amt.number_format = '#,##0'
        c_amt.alignment = right_align
        c_amt.font = income_font if is_inc else expense_font
        
        ws2.cell(row=tx_row, column=7, value=t_curr).alignment = center_align
        
        c_vnd = ws2.cell(row=tx_row, column=8, value=t['amount_vnd'])
        c_vnd.number_format = '#,##0 "₫"'
        c_vnd.alignment = right_align
        c_vnd.font = income_font if is_inc else expense_font
        
        ws2.cell(row=tx_row, column=9, value=t['note'] or '')
        
        for col_idx in range(1, 10):
            cell = ws2.cell(row=tx_row, column=col_idx)
            cell.border = thin_border
            if not is_inc and tx_row % 2 == 1:
                cell.fill = zebra_fill
            elif is_inc:
                cell.fill = income_row_fill
        tx_row += 1
        
    ws2.cell(row=tx_row, column=1, value="TỔNG CHI (VNĐ)").font = bold_font
    ws2.cell(row=tx_row, column=8, value=total_expense_vnd).font = expense_font
    ws2.cell(row=tx_row, column=8).number_format = '#,##0 "₫"'
    ws2.cell(row=tx_row, column=8).alignment = right_align
    for col_idx in range(1, 10):
        ws2.cell(row=tx_row, column=col_idx).border = thin_border
        ws2.cell(row=tx_row, column=col_idx).fill = total_row_fill
        
    tx_row += 1
    ws2.cell(row=tx_row, column=1, value="TỔNG THU (VNĐ)").font = bold_font
    ws2.cell(row=tx_row, column=8, value=total_income_vnd).font = income_font
    ws2.cell(row=tx_row, column=8).number_format = '#,##0 "₫"'
    ws2.cell(row=tx_row, column=8).alignment = right_align
    for col_idx in range(1, 10):
        ws2.cell(row=tx_row, column=col_idx).border = thin_border
        ws2.cell(row=tx_row, column=col_idx).fill = total_row_fill
        
    tx_row += 1
    ws2.cell(row=tx_row, column=1, value="SỐ DƯ RÒNG (VNĐ)").font = bold_font
    ws2.cell(row=tx_row, column=8, value=balance_vnd).font = bold_font
    ws2.cell(row=tx_row, column=8).number_format = '#,##0 "₫"'
    ws2.cell(row=tx_row, column=8).alignment = right_align
    for col_idx in range(1, 10):
        ws2.cell(row=tx_row, column=col_idx).border = double_bottom_border
        ws2.cell(row=tx_row, column=col_idx).fill = total_row_fill
        
    for col in ws2.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = max(len(str(c.value or '')) for c in col)
        ws2.column_dimensions[col_letter].width = max(max_len + 3, 14)

    # SHEET 3: SUBSCRIPTIONS
    ws3 = wb.create_sheet(title="📺 Dịch Vụ Định Kỳ")
    ws3.views.sheetView[0].showGridLines = True
    
    ws3['A1'].value = "QUẢN LÝ DỊCH VỤ ĐỊNH KỲ ĐA TIỀN TỆ"
    ws3['A1'].font = Font(name='Segoe UI', size=14, bold=True, color='1E1B4B')
    
    sub_headers = ["Tên Dịch Vụ", "Số Tiền Gốc", "Tiền Tệ", "Quy Đổi VNĐ/Tháng", "Chu Kỳ", "Ngày Gia Hạn", "Nguồn Trích Tiền", "Ghi Chú"]
    for i, h in enumerate(sub_headers, start=1):
        cell = ws3.cell(row=3, column=i, value=h)
        cell.font = table_hdr_font
        cell.fill = header_accent_fill
        cell.alignment = center_align
        
    s_row = 4
    for s in subscriptions:
        amt = s['amount']
        s_curr = (dict(s).get('currency') or 'VND')
        cycle_str = "Hàng tháng" if s['cycle'] == 'monthly' else "Hàng năm"
        
        ws3.cell(row=s_row, column=1, value=s['name']).font = bold_font
        
        c_amt = ws3.cell(row=s_row, column=2, value=amt)
        if s_curr == 'EUR': c_amt.number_format = '#,##0.00 "€"'
        elif s_curr == 'USD': c_amt.number_format = '"$"#,##0.00'
        else: c_amt.number_format = '#,##0'
        c_amt.alignment = right_align
        
        ws3.cell(row=s_row, column=3, value=s_curr).alignment = center_align
        
        c_vnd = ws3.cell(row=s_row, column=4, value=s['amount_vnd'])
        c_vnd.number_format = '#,##0 "₫"'
        c_vnd.alignment = right_align
        c_vnd.font = Font(name='Segoe UI', size=10, bold=True, color='D97706')
        
        ws3.cell(row=s_row, column=5, value=cycle_str).alignment = center_align
        b_day = s.get('billing_day', 1)
        b_month = s.get('billing_month', 1) or 1
        schedule_str = f"Ngày {b_day}/{b_month} hàng năm" if s.get('cycle') == 'yearly' else f"Ngày {b_day} hàng tháng"
        ws3.cell(row=s_row, column=6, value=schedule_str).alignment = center_align
        ws3.cell(row=s_row, column=7, value=s.get('wallet_name') or 'Mặc định').alignment = center_align
        ws3.cell(row=s_row, column=8, value=s.get('note') or '')
        
        for col_idx in range(1, 9):
            cell = ws3.cell(row=s_row, column=col_idx)
            cell.border = thin_border
            if s_row % 2 == 1: cell.fill = zebra_fill
        s_row += 1
        
    for col in ws3.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = max(len(str(c.value or '')) for c in col)
        ws3.column_dimensions[col_letter].width = max(max_len + 3, 16)

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    filename = f"Bao_Cao_Tai_Chinh_Pixel_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return send_file(
        output,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=filename
    )

# 9. BACKUP & RESTORE API
@app.route('/api/backup/export_json', methods=['GET'])
def export_json():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM categories')
    categories = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM wallets')
    wallets = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM transactions')
    transactions = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM subscriptions')
    subscriptions = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM wallet_transfers')
    transfers = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM budgets')
    budgets = [dict(r) for r in cursor.fetchall()]
    cursor.execute('SELECT * FROM settings')
    settings = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    backup_data = {
        'version': '3.0',
        'export_time': datetime.now().isoformat(),
        'categories': categories,
        'wallets': wallets,
        'transactions': transactions,
        'subscriptions': subscriptions,
        'transfers': transfers,
        'budgets': budgets,
        'settings': settings
    }
    
    output = io.BytesIO(json.dumps(backup_data, ensure_ascii=False, indent=2).encode('utf-8'))
    return send_file(
        output,
        mimetype="application/json",
        as_attachment=True,
        download_name=f"pixel_money_backup_{date.today().strftime('%Y%m%d')}.json"
    )

@app.route('/api/backup/import_json', methods=['POST'])
def import_json():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'Không tìm thấy tệp JSON tải lên!'}), 400
    file = request.files['file']
    try:
        data = json.load(file)
        conn = get_db()
        cursor = conn.cursor()
        
        if 'categories' in data and data['categories']:
            for c in data['categories']:
                cursor.execute('''
                    INSERT OR REPLACE INTO categories (id, name, type, icon, color)
                    VALUES (?, ?, ?, ?, ?)
                ''', (c.get('id'), c['name'], c.get('type', 'expense'), c.get('icon', '🏷️'), c.get('color', '#00f0ff')))

        if 'wallets' in data and data['wallets']:
            for w in data['wallets']:
                cursor.execute('''
                    INSERT OR REPLACE INTO wallets (id, name, type, initial_balance, currency, icon, color, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (w.get('id'), w['name'], w.get('type', 'bank'), w.get('initial_balance', 0), w.get('currency', 'VND'), w.get('icon', '💳'), w.get('color', '#00f0ff'), w.get('note')))
                
        if 'transactions' in data and data['transactions']:
            for t in data['transactions']:
                cursor.execute('''
                    INSERT OR REPLACE INTO transactions (id, amount, currency, amount_vnd, type, category_id, wallet_id, date, note, payment_method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (t.get('id'), t['amount'], t.get('currency', 'VND'), t.get('amount_vnd', 0), t['type'], t.get('category_id'), t.get('wallet_id'), t['date'], t.get('note'), t.get('payment_method')))
                
        if 'subscriptions' in data and data['subscriptions']:
            for s in data['subscriptions']:
                cursor.execute('''
                    INSERT OR REPLACE INTO subscriptions (id, name, amount, currency, amount_vnd, cycle, billing_day, billing_month, category_id, wallet_id, is_active, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (s.get('id'), s['name'], s['amount'], s.get('currency', 'VND'), s.get('amount_vnd', 0), s.get('cycle', 'monthly'), s.get('billing_day', 1), s.get('billing_month', 1), s.get('category_id'), s.get('wallet_id'), s.get('is_active', 1), s.get('note')))

        transfers_data = data.get('transfers') or data.get('wallet_transfers') or []
        for tr in transfers_data:
            cursor.execute('''
                INSERT OR REPLACE INTO wallet_transfers (id, from_wallet_id, to_wallet_id, amount, date, note)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (tr.get('id'), tr['from_wallet_id'], tr['to_wallet_id'], tr['amount'], tr['date'], tr.get('note')))

        if 'budgets' in data and data['budgets']:
            for b in data['budgets']:
                cursor.execute('''
                    INSERT OR REPLACE INTO budgets (id, period, expected_income, monthly_budget, savings_target_pct, month_year)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (b.get('id'), b.get('period', 'month'), b.get('expected_income', 18000000), b.get('monthly_budget', 12000000), b.get('savings_target_pct', 25), b.get('month_year', 'default')))

        if 'settings' in data and data['settings']:
            for st in data['settings']:
                cursor.execute('''
                    INSERT OR REPLACE INTO settings (key, value)
                    VALUES (?, ?)
                ''', (st['key'], str(st['value'])))
                
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Khôi phục dữ liệu sao lưu thành công!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi đọc tệp sao lưu: {str(e)}'}), 400

if __name__ == '__main__':
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    port = 5000
    print("==================================================")
    print("  VI TIEN PIXEL (PIXEL EXPENSE MANAGER)")
    print(f"  Running at: http://127.0.0.1:{port}")
    print("==================================================")
    app.run(host='127.0.0.1', port=port, debug=False)
