import sqlite3
import os
from datetime import datetime, date, timedelta

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'money_pixel.db')

DEFAULT_RATES = {
    'USD_VND': 25400.0,
    'EUR_VND': 27600.0
}

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def get_exchange_rates(conn=None):
    close_after = False
    if conn is None:
        conn = get_db()
        close_after = True
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings WHERE key LIKE 'rate_%'")
    rows = cursor.fetchall()
    rates = {
        'USD_VND': DEFAULT_RATES['USD_VND'],
        'EUR_VND': DEFAULT_RATES['EUR_VND']
    }
    for r in rows:
        if r['key'] == 'rate_USD_VND':
            try: rates['USD_VND'] = float(r['value'])
            except: pass
        elif r['key'] == 'rate_EUR_VND':
            try: rates['EUR_VND'] = float(r['value'])
            except: pass
    if close_after:
        conn.close()
    return rates

def convert_currency(amount, from_curr, to_curr, rates=None):
    if rates is None:
        rates = DEFAULT_RATES
    from_curr = (from_curr or 'VND').upper()
    to_curr = (to_curr or 'VND').upper()
    if from_curr == to_curr:
        return amount
        
    rate_usd = rates.get('USD_VND', DEFAULT_RATES['USD_VND'])
    rate_eur = rates.get('EUR_VND', DEFAULT_RATES['EUR_VND'])
    
    # 1. Convert source to VND
    if from_curr == 'VND':
        in_vnd = amount
    elif from_curr == 'USD':
        in_vnd = amount * rate_usd
    elif from_curr == 'EUR':
        in_vnd = amount * rate_eur
    else:
        in_vnd = amount
        
    # 2. Convert VND to target
    if to_curr == 'VND':
        return round(in_vnd, 0)
    elif to_curr == 'USD':
        return round(in_vnd / rate_usd, 2)
    elif to_curr == 'EUR':
        return round(in_vnd / rate_eur, 2)
    return in_vnd

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # 1. Categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'expense',
            icon TEXT NOT NULL,
            color TEXT NOT NULL
        )
    ''')
    
    # 2. Wallets / Money Sources table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'bank', -- 'cash', 'bank', 'ewallet', 'credit', 'savings'
            initial_balance REAL NOT NULL DEFAULT 0.0,
            currency TEXT NOT NULL DEFAULT 'VND', -- 'VND', 'EUR', 'USD'
            icon TEXT NOT NULL DEFAULT '💵',
            color TEXT NOT NULL DEFAULT '#00f0ff',
            note TEXT
        )
    ''')
    
    cursor.execute("PRAGMA table_info(wallets)")
    w_cols = [r['name'] for r in cursor.fetchall()]
    if 'currency' not in w_cols:
        cursor.execute("ALTER TABLE wallets ADD COLUMN currency TEXT NOT NULL DEFAULT 'VND'")
    
    # 3. Wallet Transfers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wallet_transfers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_wallet_id INTEGER NOT NULL,
            to_wallet_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_wallet_id) REFERENCES wallets (id) ON DELETE CASCADE,
            FOREIGN KEY (to_wallet_id) REFERENCES wallets (id) ON DELETE CASCADE
        )
    ''')
    
    # 4. Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'VND', -- 'VND', 'EUR', 'USD'
            amount_vnd REAL NOT NULL DEFAULT 0.0,
            type TEXT NOT NULL, -- 'expense' or 'income'
            category_id INTEGER,
            wallet_id INTEGER,
            date TEXT NOT NULL, -- 'YYYY-MM-DD'
            note TEXT,
            payment_method TEXT DEFAULT 'Tiền mặt',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
            FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE SET NULL
        )
    ''')
    
    cursor.execute("PRAGMA table_info(transactions)")
    t_cols = [r['name'] for r in cursor.fetchall()]
    if 'currency' not in t_cols:
        cursor.execute("ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'VND'")
    if 'amount_vnd' not in t_cols:
        cursor.execute("ALTER TABLE transactions ADD COLUMN amount_vnd REAL NOT NULL DEFAULT 0.0")
    if 'wallet_id' not in t_cols:
        cursor.execute("ALTER TABLE transactions ADD COLUMN wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL")
    
    # 5. Subscriptions / Services table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL DEFAULT 'VND',
            amount_vnd REAL NOT NULL DEFAULT 0.0,
            cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
            billing_day INTEGER NOT NULL DEFAULT 1, -- 1 to 31
            billing_month INTEGER NOT NULL DEFAULT 1, -- 1 to 12 (used when cycle is 'yearly')
            category_id INTEGER,
            wallet_id INTEGER,
            is_active INTEGER NOT NULL DEFAULT 1,
            note TEXT,
            last_billed_date TEXT,
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
            FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE SET NULL
        )
    ''')
    
    cursor.execute("PRAGMA table_info(subscriptions)")
    sub_cols = [r['name'] for r in cursor.fetchall()]
    if 'currency' not in sub_cols:
        cursor.execute("ALTER TABLE subscriptions ADD COLUMN currency TEXT NOT NULL DEFAULT 'VND'")
    if 'amount_vnd' not in sub_cols:
        cursor.execute("ALTER TABLE subscriptions ADD COLUMN amount_vnd REAL NOT NULL DEFAULT 0.0")
    if 'wallet_id' not in sub_cols:
        cursor.execute("ALTER TABLE subscriptions ADD COLUMN wallet_id INTEGER REFERENCES wallets(id) ON DELETE SET NULL")
    if 'billing_month' not in sub_cols:
        cursor.execute("ALTER TABLE subscriptions ADD COLUMN billing_month INTEGER NOT NULL DEFAULT 1")
    
    # 6. Budgets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period TEXT NOT NULL,
            expected_income REAL DEFAULT 18000000,
            monthly_budget REAL DEFAULT 12000000,
            savings_target_pct REAL DEFAULT 25,
            month_year TEXT NOT NULL,
            income_type TEXT DEFAULT 'variable',
            runway_target_months REAL DEFAULT 6.0
        )
    ''')
    
    cursor.execute("PRAGMA table_info(budgets)")
    b_cols = [r['name'] for r in cursor.fetchall()]
    if 'income_type' not in b_cols:
        cursor.execute("ALTER TABLE budgets ADD COLUMN income_type TEXT DEFAULT 'variable'")
    if 'runway_target_months' not in b_cols:
        cursor.execute("ALTER TABLE budgets ADD COLUMN runway_target_months REAL DEFAULT 6.0")
    
    # 7. Settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    ''')
    
    # Default settings & Exchange rates
    default_settings = [
        ('currency', 'VND'),
        ('active_currency', 'VND'),
        ('rate_USD_VND', '25400'),
        ('rate_EUR_VND', '27600'),
        ('sound_enabled', '1'),
        ('theme', 'retro-dark'),
        ('user_name', 'Pixel Saver')
    ]
    for key, val in default_settings:
        cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (key, val))
        
    # Check default wallets - only seed once on initial setup!
    cursor.execute("SELECT value FROM settings WHERE key = 'wallets_initialized'")
    w_init = cursor.fetchone()
    if not w_init:
        cursor.execute("SELECT COUNT(*) as count FROM wallets")
        if cursor.fetchone()['count'] == 0:
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
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('wallets_initialized', '1')")
            
    # Backfill amount_vnd for transactions where it's 0
    rates = get_exchange_rates(conn)
    cursor.execute("SELECT id, amount, currency FROM transactions WHERE amount_vnd = 0 OR amount_vnd IS NULL")
    for r in cursor.fetchall():
        in_vnd = convert_currency(r['amount'], r['currency'] or 'VND', 'VND', rates)
        cursor.execute("UPDATE transactions SET amount_vnd = ?, currency = ? WHERE id = ?", (in_vnd, r['currency'] or 'VND', r['id']))
        
    # Backfill amount_vnd for subscriptions where it's 0
    cursor.execute("SELECT id, amount, currency FROM subscriptions WHERE amount_vnd = 0 OR amount_vnd IS NULL")
    for r in cursor.fetchall():
        in_vnd = convert_currency(r['amount'], r['currency'] or 'VND', 'VND', rates)
        cursor.execute("UPDATE subscriptions SET amount_vnd = ?, currency = ? WHERE id = ?", (in_vnd, r['currency'] or 'VND', r['id']))

    conn.commit()
    conn.close()

def calculate_wallet_balances():
    """Returns list of wallets with accurate current balance in native currency and in VND"""
    conn = get_db()
    cursor = conn.cursor()
    rates = get_exchange_rates(conn)
    
    cursor.execute("SELECT * FROM wallets ORDER BY id ASC")
    wallets = [dict(r) for r in cursor.fetchall()]
    
    for w in wallets:
        w_id = w['id']
        w_curr = w.get('currency', 'VND') or 'VND'
        
        # Incomes
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'income'", (w_id,))
        inc = float(cursor.fetchone()['total'])
        
        # Expenses
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE wallet_id = ? AND type = 'expense'", (w_id,))
        exp = float(cursor.fetchone()['total'])
        
        # Transfers received
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transfers WHERE to_wallet_id = ?", (w_id,))
        tf_in = float(cursor.fetchone()['total'])
        
        # Transfers sent
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM wallet_transfers WHERE from_wallet_id = ?", (w_id,))
        tf_out = float(cursor.fetchone()['total'])
        
        cur_bal = w['initial_balance'] + inc - exp + tf_in - tf_out
        if w_curr in ['EUR', 'USD']:
            w['current_balance'] = round(cur_bal, 2)
        else:
            w['current_balance'] = round(cur_bal, 0)
            
        w['total_income'] = inc
        w['total_expense'] = exp
        w['balance_vnd'] = convert_currency(w['current_balance'], w_curr, 'VND', rates)
        
    conn.close()
    return wallets

if __name__ == '__main__':
    init_db()
    print("Database multi-currency migration completed!")
