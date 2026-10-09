// === PIXEL EXPENSE MANAGER - MULTI-CURRENCY (EUR, USD, VND) & i18n (VN, EN, DEU) ===

let currentCurrency = localStorage.getItem('pixel_active_currency') || 'VND';
let currentPeriod = 'month';
let categoriesList = [];
let walletsList = [];
let selectedWalletFilter = null;
let categoryChartInstance = null;
let timelineChartInstance = null;
let currentEditingTxId = null;
let currentEditingSubId = null;
let currentBudgetModalCurrency = currentCurrency;
let currentBudgetIncomeType = 'variable';
let savedBudgetVnd = {
    income_type: 'variable',
    runway_target_months: 6,
    expected_income: 0,
    monthly_budget: 15000000,
    savings_target_pct: 25
};

let exchangeRates = {
    USD_VND: 25400.0,
    EUR_VND: 27600.0,
    EUR_USD: 1.0866
};

// 1. CURRENCY CONVERSION & FORMATTING
function convertCurrency(amount, fromCurr, toCurr) {
    if (isNaN(amount) || amount === null) return 0;
    fromCurr = (fromCurr || 'VND').toUpperCase();
    toCurr = (toCurr || 'VND').toUpperCase();
    if (fromCurr === toCurr) return amount;

    const rUSD = exchangeRates.USD_VND || 25400.0;
    const rEUR = exchangeRates.EUR_VND || 27600.0;

    let inVND = amount;
    if (fromCurr === 'USD') inVND = amount * rUSD;
    else if (fromCurr === 'EUR') inVND = amount * rEUR;

    if (toCurr === 'VND') return Math.round(inVND);
    if (toCurr === 'USD') return Math.round((inVND / rUSD) * 100) / 100;
    if (toCurr === 'EUR') return Math.round((inVND / rEUR) * 100) / 100;
    return inVND;
}

function formatMoney(amount, currency = currentCurrency) {
    if (isNaN(amount) || amount === null) amount = 0;
    currency = (currency || 'VND').toUpperCase();

    const locale = typeof currentLang !== 'undefined' ? (currentLang === 'de' ? 'de-DE' : (currentLang === 'en' ? 'en-US' : 'vi-VN')) : 'vi-VN';

    if (currency === 'EUR') {
        return amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    } else if (currency === 'USD') {
        return '$ ' + amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        return Math.round(amount).toLocaleString('vi-VN') + ' ₫';
    }
}

// Retro Animated number counter
function animateNumber(element, start, end, duration = 650, currency = currentCurrency) {
    if (!element) return;
    if (isNaN(start) || start === null) start = 0;
    if (isNaN(end) || end === null) end = 0;

    if (start === end) {
        element.textContent = formatMoney(end, currency);
        return;
    }

    const startTime = performance.now();
    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - progress) * (1 - progress);
        const current = start + (end - start) * ease;
        element.textContent = formatMoney(current, currency);
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatMoney(end, currency);
        }
    }
    requestAnimationFrame(update);
}

// Retro Coin Particle Burst Animation
function triggerCoinBurst(originX, originY) {
    const x = originX || window.innerWidth / 2;
    const y = originY || window.innerHeight / 2;
    const emojis = ['🪙', '✨', '💶', '💵', '⭐', '💎'];
    const count = 15;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'coin-particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const distance = 60 + Math.random() * 95;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1250);
    }
}

// Toast notification
function showToast(message, icon = '👾') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'pixel-toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initSoundToggle();
    initCurrencySwitcher();
    initLanguageSwitcher();
    updateTodayDisplay();
    setInterval(updateTodayDisplay, 60000);
    loadRates();
    loadCategories();
    loadWallets();
    loadDashboard();
    setupEventListeners();
});

function initSoundToggle() {
    const btn = document.getElementById('soundToggleBtn');
    if (!btn) return;
    const isMuted = SoundEffects.isMuted();
    btn.innerHTML = isMuted ? t('btn_sound_off') : t('btn_sound_on');
    btn.addEventListener('click', () => {
        const muted = SoundEffects.toggleMute();
        btn.innerHTML = muted ? t('btn_sound_off') : t('btn_sound_on');
        if (!muted) SoundEffects.playClick();
    });
}

function initCurrencySwitcher() {
    document.querySelectorAll('.currency-pill').forEach(pill => {
        if (pill.dataset.curr === currentCurrency) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
        pill.addEventListener('click', () => {
            SoundEffects.playClick();
            document.querySelectorAll('.currency-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentCurrency = pill.dataset.curr;
            localStorage.setItem('pixel_active_currency', currentCurrency);
            showToast(`${currentCurrency}`, currentCurrency === 'EUR' ? '💶' : (currentCurrency === 'USD' ? '💵' : '🪙'));
            loadDashboard();
        });
    });
}

function initLanguageSwitcher() {
    // Init active language
    setLanguage(currentLang);

    document.querySelectorAll('.lang-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            SoundEffects.playClick();
            const lang = pill.dataset.lang;
            setLanguage(lang);
            showToast(`Language: ${lang.toUpperCase()}`, '🌐');
        });
    });
}

// 3. LOAD RATES
async function loadRates() {
    try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        if (data.success && data.rates) {
            exchangeRates = data.rates;
            const rUsdInput = document.getElementById('rateUsdInput');
            const rEurInput = document.getElementById('rateEurInput');
            if (rUsdInput) rUsdInput.value = exchangeRates.USD_VND;
            if (rEurInput) rEurInput.value = exchangeRates.EUR_VND;
            updateConverterCalculations();
        }
    } catch (e) {
        console.error('Error loading rates:', e);
    }
}

// 4. LOAD CATEGORIES
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
            categoriesList = data.categories;
            populateCategorySelect();
        }
    } catch (e) {
        console.error('Error loading categories:', e);
    }
}

function populateCategorySelect(type = 'expense') {
    const select = document.getElementById('txCategory');
    const filterSelect = document.getElementById('filterCategory');
    const depositCatSelect = document.getElementById('depositCategory');
    
    if (select) {
        const currentVal = select.value;
        select.innerHTML = '';
        const filtered = categoriesList.filter(c => c.type === type);
        filtered.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.icon} ${getCategoryName(c.name)}`;
            if (String(c.id) === String(currentVal)) opt.selected = true;
            select.appendChild(opt);
        });
    }

    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="">${t('filter_all_cats')}</option>`;
        categoriesList.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.icon} ${getCategoryName(c.name)}`;
            if (String(c.id) === String(currentVal)) opt.selected = true;
            filterSelect.appendChild(opt);
        });
    }

    if (depositCatSelect) {
        const currentVal = depositCatSelect.value;
        depositCatSelect.innerHTML = '';
        categoriesList.filter(c => c.type === 'income').forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.icon} ${getCategoryName(c.name)}`;
            if (String(c.id) === String(currentVal)) opt.selected = true;
            depositCatSelect.appendChild(opt);
        });
    }

    const subCatSelect = document.getElementById('subCategory');
    if (subCatSelect) {
        const currentVal = subCatSelect.value;
        subCatSelect.innerHTML = '';
        categoriesList.filter(c => c.type === 'expense').forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.icon} ${getCategoryName(c.name)}`;
            if (String(c.id) === String(currentVal)) opt.selected = true;
            subCatSelect.appendChild(opt);
        });
    }
}

function populateWalletTypeSelect() {
    const sel = document.getElementById('walletType');
    if (!sel) return;
    const currentVal = sel.value || 'bank';
    const types = ['bank', 'cash', 'ewallet', 'credit', 'savings'];
    sel.innerHTML = '';
    types.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = getWalletTypeName(type, false);
        if (type === currentVal) opt.selected = true;
        sel.appendChild(opt);
    });
}

function populateSubCycleSelect() {
    const sel = document.getElementById('subCycle');
    if (!sel) return;
    const currentVal = sel.value || 'monthly';
    sel.innerHTML = `
        <option value="monthly"${currentVal === 'monthly' ? ' selected' : ''}>${t('cycle_monthly')}</option>
        <option value="yearly"${currentVal === 'yearly' ? ' selected' : ''}>${t('cycle_yearly')}</option>
    `;
}

function populateFilterTypeSelect() {
    const sel = document.getElementById('filterType');
    if (!sel) return;
    const currentVal = sel.value || '';
    sel.innerHTML = `
        <option value=""${currentVal === '' ? ' selected' : ''}>${t('filter_all_types')}</option>
        <option value="expense"${currentVal === 'expense' ? ' selected' : ''}>${t('type_expense')}</option>
        <option value="income"${currentVal === 'income' ? ' selected' : ''}>${t('type_income')}</option>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// 5. LOAD WALLETS / MONEY SOURCES
async function loadWallets() {
    try {
        const res = await fetch('/api/wallets');
        const data = await res.json();
        if (!data.success) return;

        walletsList = data.wallets;
        
        // Update Total Assets in Active Currency
        const totalAssetsEl = document.getElementById('kpiTotalAssets');
        if (totalAssetsEl) {
            const targetVal = convertCurrency(data.total_assets_vnd, 'VND', currentCurrency);
            const oldVal = parseFloat(totalAssetsEl.dataset.val || 0);
            animateNumber(totalAssetsEl, oldVal, targetVal, 650, currentCurrency);
            totalAssetsEl.dataset.val = targetVal;
        }

        renderWalletsGrid(walletsList);
        populateWalletSelects();

    } catch (e) {
        console.error('Error loading wallets:', e);
    }
}

function renderWalletsGrid(wallets) {
    const container = document.getElementById('walletsGrid');
    if (!container) return;
    container.innerHTML = '';

    if (!wallets || wallets.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2.2rem 1.2rem; background: var(--bg-card); border: 2px dashed var(--border-light); border-radius: 4px;">
                <div style="font-size: 2.4rem; margin-bottom: 0.6rem;">💼</div>
                <div style="font-family: var(--font-pixel); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.1rem; line-height: 1.5;">
                    ${t('wallets_empty_msg')}
                </div>
                <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                    <button class="pixel-btn pixel-btn-primary" onclick="openAddWalletModal()">
                        ${t('btn_add_wallet')}
                    </button>
                    <button class="pixel-btn" onclick="resetDefaultWallets()">
                        ${t('btn_reset_default_wallets')}
                    </button>
                </div>
            </div>
        `;
        return;
    }

    wallets.forEach(w => {
        const card = document.createElement('div');
        card.className = 'wallet-card';
        if (selectedWalletFilter == w.id) {
            card.classList.add('active-filter');
        }
        card.style.setProperty('--wallet-color', w.color || '#00f0ff');

        const badgeText = getWalletTypeName(w.type, true);
        const wCurr = w.currency || 'VND';
        const convertedStr = wCurr !== currentCurrency ? ` ≈ ${formatMoney(convertCurrency(w.current_balance, wCurr, currentCurrency), currentCurrency)}` : '';

        card.innerHTML = `
            <div class="wallet-top">
                <div class="wallet-icon-name">
                    <span style="font-size: 1.4rem;">${w.icon}</span>
                    <span>${w.name}</span>
                </div>
                <div style="display: flex; gap: 0.3rem; align-items: center;">
                    <span class="currency-tag">${wCurr}</span>
                    <span class="wallet-type-badge">${badgeText}</span>
                </div>
            </div>
            <div class="wallet-balance" id="wBal_${w.id}">${formatMoney(w.current_balance, wCurr)}</div>
            <div class="wallet-footer">
                <span style="font-size: 0.72rem; color: var(--text-muted);">${convertedStr || (w.note || '')}</span>
                <div class="wallet-quick-actions" onclick="event.stopPropagation();" style="display: flex; gap: 0.35rem;">
                    <button class="pixel-btn pixel-btn-sm pixel-btn-success" onclick="openDepositModal(${w.id})" title="${t('btn_deposit')}">
                        ${t('btn_quick_deposit')}
                    </button>
                    <button class="pixel-btn pixel-btn-sm pixel-btn-danger" onclick="deleteWalletConfirm(${w.id}, '${escapeHtml(w.name)}')" title="${t('btn_delete_wallet')}">
                        🗑️
                    </button>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            SoundEffects.playClick();
            if (selectedWalletFilter == w.id) {
                selectedWalletFilter = null;
                showToast(t('filter_all_wallets'), '🔄');
            } else {
                selectedWalletFilter = w.id;
                showToast(w.name, w.icon);
            }
            renderWalletsGrid(walletsList);
            loadTransactions();
        });

        container.appendChild(card);
    });
}

async function deleteWalletConfirm(walletId, walletName) {
    SoundEffects.playClick();
    const confirmMsg = t('confirm_delete_wallet', { name: walletName });
    if (!confirm(confirmMsg)) return;
    try {
        const res = await fetch(`/api/wallets/${walletId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playDelete();
            showToast(t('wallet_deleted'), '🗑️');
            if (selectedWalletFilter == walletId) {
                selectedWalletFilter = null;
            }
            await loadWallets();
            await loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error('Error deleting wallet:', e);
    }
}

async function resetDefaultWallets() {
    SoundEffects.playClick();
    try {
        const res = await fetch('/api/wallets/reset_defaults', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            showToast(data.message, '💼');
            await loadWallets();
            await loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

function populateWalletSelects() {
    const txWalletSelect = document.getElementById('txWallet');
    const filterWalletSelect = document.getElementById('filterWallet');
    const depWalletSelect = document.getElementById('depositWallet');
    const tfFromSelect = document.getElementById('transferFromWallet');
    const tfToSelect = document.getElementById('transferToWallet');
    const subWalletSelect = document.getElementById('subWallet');

    const selects = [txWalletSelect, depWalletSelect, tfFromSelect, tfToSelect, subWalletSelect];
    selects.forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '';
        if (walletsList.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = `[${t('no_wallet_selected')}]`;
            sel.appendChild(opt);
        } else {
            walletsList.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.id;
                opt.textContent = `${w.icon} ${w.name} [${w.currency}] (${formatMoney(w.current_balance, w.currency)})`;
                sel.appendChild(opt);
            });
        }
    });

    if (filterWalletSelect) {
        filterWalletSelect.innerHTML = `<option value="">${t('filter_all_wallets')}</option>`;
        walletsList.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.id;
            opt.textContent = `${w.icon} ${w.name} [${w.currency}]`;
            filterWalletSelect.appendChild(opt);
        });
        if (selectedWalletFilter) {
            filterWalletSelect.value = selectedWalletFilter;
        }
    }

    if (tfToSelect && tfToSelect.options.length > 1) {
        tfToSelect.selectedIndex = 1;
    }
}

// 6. LOAD ALL DASHBOARD DATA
async function loadDashboard() {
    await Promise.all([
        loadBudgetHealth(),
        loadAnalytics(),
        loadTransactions(),
        loadSubscriptions(),
        loadWallets()
    ]);
}

// 7. LOAD BUDGET RECOMMENDATION & HEALTH HP
async function loadBudgetHealth() {
    try {
        const res = await fetch('/api/budget/recommendation');
        const data = await res.json();
        if (!data.success) return;

        const { health, recommendations, settings, actuals } = data;

        // Update HP Bar
        const hpInner = document.getElementById('hpBarInner');
        const hpText = document.getElementById('hpValueText');
        const hpTitle = document.getElementById('hpTitleText');
        const runwayBadge = document.getElementById('runwayBadge');
        const npcAvatar = document.getElementById('npcAvatar');
        const npcTitle = document.getElementById('npcAdviceTitle');
        const npcText = document.getElementById('npcAdviceText');

        if (hpInner) {
            hpInner.style.width = `${health.hp_percent}%`;
            hpInner.className = 'hp-bar-inner';
            if (health.status_level === 'warning') hpInner.classList.add('warning');
            else if (health.status_level === 'danger') hpInner.classList.add('danger');
        }

        if (hpText) hpText.textContent = `${health.hp_percent} / 100 HP`;
        if (npcAvatar) npcAvatar.textContent = health.npc_avatar;

        const isVariableIncome = (settings.income_type === 'variable');

        // Dynamic Title & Runway Badge
        if (hpTitle) {
            hpTitle.textContent = isVariableIncome ? t('health_title_runway') : t('health_title');
        }

        if (runwayBadge) {
            if (isVariableIncome) {
                runwayBadge.style.display = 'inline-flex';
                const rw = recommendations.runway_months || 0;
                const rwTarget = settings.runway_target_months || 6;
                runwayBadge.textContent = health.runway_badge_text || `🛡️ Dự trữ: ${rw} tháng`;
                if (rw >= rwTarget) {
                    runwayBadge.style.background = 'rgba(0, 255, 102, 0.15)';
                    runwayBadge.style.borderColor = 'var(--color-success)';
                    runwayBadge.style.color = 'var(--color-success)';
                } else if (rw >= 3) {
                    runwayBadge.style.background = 'rgba(255, 204, 0, 0.15)';
                    runwayBadge.style.borderColor = 'var(--color-warning)';
                    runwayBadge.style.color = 'var(--color-warning)';
                } else {
                    runwayBadge.style.background = 'rgba(255, 51, 68, 0.15)';
                    runwayBadge.style.borderColor = 'var(--color-danger)';
                    runwayBadge.style.color = 'var(--color-danger)';
                }
            } else {
                runwayBadge.style.display = 'none';
            }
        }
        
        // Multi-language NPC advice with exact currency format
        const safeDailyCurr = formatMoney(convertCurrency(recommendations.safe_daily_vnd, 'VND', currentCurrency), currentCurrency);
        const remMonthCurr = formatMoney(convertCurrency(recommendations.remaining_month_vnd, 'VND', currentCurrency), currentCurrency);

        if (npcTitle) {
            if (health.advice_title) {
                npcTitle.textContent = health.advice_title;
            } else {
                if (health.status_level === 'excellent') npcTitle.textContent = t('status_safe');
                else if (health.status_level === 'warning') npcTitle.textContent = t('status_warning');
                else npcTitle.textContent = t('status_danger');
            }
        }
        if (npcText) {
            if (isVariableIncome && health.advice_text) {
                npcText.textContent = health.advice_text;
            } else {
                if (health.status_level === 'excellent') {
                    npcText.textContent = t('npc_advice_safe', { amount: safeDailyCurr });
                } else if (health.status_level === 'warning') {
                    npcText.textContent = t('npc_advice_warning', { amount: safeDailyCurr });
                } else {
                    npcText.textContent = t('npc_advice_danger', { rem: remMonthCurr, days: data.days_left_in_month || 1, amount: safeDailyCurr });
                }
            }
        }

        // Animated Safe Daily Budget in Current Currency
        const safeDailyEl = document.getElementById('kpiSafeDaily');
        if (safeDailyEl) {
            const targetVal = convertCurrency(recommendations.safe_daily_vnd, 'VND', currentCurrency);
            const oldVal = parseFloat(safeDailyEl.dataset.val || 0);
            animateNumber(safeDailyEl, oldVal, targetVal, 650, currentCurrency);
            safeDailyEl.dataset.val = targetVal;
        }

        // Update Budget Breakdown Cards in Current Currency
        const bdSafeDay = document.getElementById('bdSafeDay');
        const bdSpentToday = document.getElementById('bdSpentToday');
        const bdRemWeek = document.getElementById('bdRemWeek');
        const bdRemMonth = document.getElementById('bdRemMonth');
        const bdFixedSub = document.getElementById('bdFixedSub');
        const bdBreakdownTitle = document.getElementById('bdBreakdownTitle');
        const bdRuleNeedsLabel = document.getElementById('bdRuleNeedsLabel');
        const bdRuleNeeds = document.getElementById('bdRuleNeeds');
        const bdRuleWantsLabel = document.getElementById('bdRuleWantsLabel');
        const bdRuleWants = document.getElementById('bdRuleWants');
        const bdRuleSavingsLabel = document.getElementById('bdRuleSavingsLabel');
        const bdRuleSavings = document.getElementById('bdRuleSavings');

        const todaySafeRemaining = recommendations.today_remaining_vnd !== undefined 
            ? recommendations.today_remaining_vnd 
            : Math.max(0, recommendations.safe_daily_vnd - actuals.today_expense_vnd);

        if (bdSafeDay) {
            bdSafeDay.textContent = formatMoney(convertCurrency(todaySafeRemaining, 'VND', currentCurrency), currentCurrency);
            if (actuals.today_expense_vnd > recommendations.safe_daily_vnd && recommendations.safe_daily_vnd > 0) {
                bdSafeDay.style.color = 'var(--color-danger)';
            } else {
                bdSafeDay.style.color = 'var(--color-accent)';
            }
        }
        if (bdSpentToday) bdSpentToday.textContent = formatMoney(convertCurrency(actuals.today_expense_vnd, 'VND', currentCurrency), currentCurrency);
        if (bdRemWeek) bdRemWeek.textContent = formatMoney(convertCurrency(recommendations.remaining_weekly_vnd, 'VND', currentCurrency), currentCurrency);
        if (bdRemMonth) bdRemMonth.textContent = formatMoney(convertCurrency(recommendations.remaining_month_vnd, 'VND', currentCurrency), currentCurrency);
        if (bdFixedSub) bdFixedSub.textContent = formatMoney(convertCurrency(settings.fixed_subscriptions, 'VND', currentCurrency), currentCurrency);

        if (isVariableIncome) {
            if (bdBreakdownTitle) bdBreakdownTitle.textContent = t('breakdown_title_runway');
            if (bdRuleNeedsLabel) bdRuleNeedsLabel.textContent = t('lbl_runway_current');
            if (bdRuleNeeds) {
                const totalAssetsConverted = formatMoney(convertCurrency(settings.total_assets_vnd, 'VND', currentCurrency), currentCurrency);
                const monthWord = t('opt_runway_3').includes('tháng') ? 'tháng' : (currentLang === 'de' ? 'Monate' : 'months');
                bdRuleNeeds.textContent = `${recommendations.runway_months} ${monthWord} (${totalAssetsConverted})`;
                bdRuleNeeds.style.color = recommendations.runway_months >= settings.runway_target_months ? 'var(--color-success)' : 'var(--color-warning)';
            }
            if (bdRuleWantsLabel) bdRuleWantsLabel.textContent = t('lbl_monthly_burn');
            if (bdRuleWants) {
                bdRuleWants.textContent = formatMoney(convertCurrency(settings.monthly_burn, 'VND', currentCurrency), currentCurrency);
                bdRuleWants.style.color = 'var(--color-accent)';
            }
            if (bdRuleSavingsLabel) bdRuleSavingsLabel.textContent = t('lbl_cashflow_status');
            if (bdRuleSavings) {
                const netCashflow = actuals.net_month_cashflow_vnd !== undefined 
                    ? actuals.net_month_cashflow_vnd 
                    : (actuals.month_income_vnd - actuals.month_expense_vnd);
                const netFormatted = formatMoney(convertCurrency(Math.abs(netCashflow), 'VND', currentCurrency), currentCurrency);
                bdRuleSavings.textContent = (netCashflow >= 0 ? '+ ' : '- ') + netFormatted;
                bdRuleSavings.style.color = netCashflow >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
            }
        } else {
            if (bdBreakdownTitle) bdBreakdownTitle.textContent = t('rule_50_30_20_title');
            if (bdRuleNeedsLabel) bdRuleNeedsLabel.textContent = t('rule_needs');
            if (bdRuleNeeds) {
                bdRuleNeeds.textContent = formatMoney(convertCurrency(recommendations.rule_50_30_20.needs, 'VND', currentCurrency), currentCurrency);
                bdRuleNeeds.style.color = 'var(--color-primary)';
            }
            if (bdRuleWantsLabel) bdRuleWantsLabel.textContent = t('rule_wants');
            if (bdRuleWants) {
                bdRuleWants.textContent = formatMoney(convertCurrency(recommendations.rule_50_30_20.wants, 'VND', currentCurrency), currentCurrency);
                bdRuleWants.style.color = 'var(--color-warning)';
            }
            if (bdRuleSavingsLabel) {
                const savingsPct = Math.round(settings.savings_target_pct || 25);
                bdRuleSavingsLabel.textContent = `💰 ${savingsPct}% ${t('rule_savings_label') || 'Tiết kiệm & Tích lũy'}:`;
            }
            if (bdRuleSavings) {
                bdRuleSavings.textContent = formatMoney(convertCurrency(recommendations.rule_50_30_20.savings, 'VND', currentCurrency), currentCurrency);
                bdRuleSavings.style.color = 'var(--color-success)';
            }
        }

        // Store persistent VND budget settings and update budget modal display
        savedBudgetVnd = {
            income_type: settings.income_type || 'variable',
            runway_target_months: settings.runway_target_months || 6,
            expected_income: settings.expected_income || 0,
            monthly_budget: settings.monthly_budget || 15000000,
            savings_target_pct: settings.savings_target_pct || 25
        };
        currentBudgetIncomeType = savedBudgetVnd.income_type;
        updateBudgetModalDisplay();

    } catch (e) {
        console.error('Error loading budget recommendation:', e);
    }
}

// 8. LOAD ANALYTICS & CHARTS
async function loadAnalytics() {
    try {
        const res = await fetch(`/api/analytics?period=${currentPeriod}`);
        const data = await res.json();
        if (!data.success) return;

        const kpiExpense = document.getElementById('kpiTotalExpense');
        const kpiIncome = document.getElementById('kpiTotalIncome');
        const kpiBalance = document.getElementById('kpiBalance');
        const kpiTxCount = document.getElementById('kpiTxCount');

        const expConverted = convertCurrency(data.kpi.total_expense_vnd, 'VND', currentCurrency);
        const incConverted = convertCurrency(data.kpi.total_income_vnd, 'VND', currentCurrency);
        const balConverted = convertCurrency(data.kpi.balance_vnd, 'VND', currentCurrency);

        if (kpiExpense) {
            const oldVal = parseFloat(kpiExpense.dataset.val || 0);
            animateNumber(kpiExpense, oldVal, expConverted, 650, currentCurrency);
            kpiExpense.dataset.val = expConverted;
        }

        if (kpiIncome) {
            const oldVal = parseFloat(kpiIncome.dataset.val || 0);
            animateNumber(kpiIncome, oldVal, incConverted, 650, currentCurrency);
            kpiIncome.dataset.val = incConverted;
        }

        if (kpiBalance) {
            const oldVal = parseFloat(kpiBalance.dataset.val || 0);
            animateNumber(kpiBalance, oldVal, balConverted, 650, currentCurrency);
            kpiBalance.dataset.val = balConverted;
            kpiBalance.style.color = data.kpi.balance_vnd >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        }

        if (kpiTxCount) {
            const txWord = currentLang === 'de' ? 'Transaktionen' : (currentLang === 'en' ? 'transactions' : 'giao dịch');
            kpiTxCount.textContent = `${data.kpi.tx_count} ${txWord}`;
        }

        renderCategoryChart(data.category_chart);
        renderTimelineChart(data.timeline_chart);
        renderTopExpenses(data.top_expenses);

    } catch (e) {
        console.error('Error loading analytics:', e);
    }
}

function renderCategoryChart(catData) {
    const canvas = document.getElementById('categoryChartCanvas');
    if (!canvas) return;

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    if (!catData.labels.length || catData.data.reduce((a,b)=>a+b, 0) === 0) {
        canvas.style.display = 'none';
        let emptyMsg = document.getElementById('catChartEmpty');
        if (!emptyMsg) {
            emptyMsg = document.createElement('div');
            emptyMsg.id = 'catChartEmpty';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.padding = '2.5rem 1rem';
            emptyMsg.style.fontFamily = 'var(--font-pixel)';
            emptyMsg.style.fontSize = '0.75rem';
            emptyMsg.style.color = 'var(--text-muted)';
            emptyMsg.textContent = t('chart_empty');
            canvas.parentNode.appendChild(emptyMsg);
        } else {
            emptyMsg.textContent = t('chart_empty');
            emptyMsg.style.display = 'block';
        }
        return;
    } else {
        canvas.style.display = 'block';
        const emptyMsg = document.getElementById('catChartEmpty');
        if (emptyMsg) emptyMsg.style.display = 'none';
    }

    const convertedData = catData.data.map(v => convertCurrency(v, 'VND', currentCurrency));

    const ctx = canvas.getContext('2d');
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: (catData.labels || []).map(l => getCategoryName(l)),
            datasets: [{
                data: convertedData,
                backgroundColor: catData.colors,
                borderColor: '#0b0818',
                borderWidth: 3,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { animateScale: true, animateRotate: true, duration: 800 },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f0f0ff', font: { family: 'Be Vietnam Pro', size: 11 }, boxWidth: 14, padding: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` ${ctx.label}: ${formatMoney(ctx.raw, currentCurrency)}`;
                        }
                    }
                }
            },
            cutout: '58%'
        }
    });
}

function renderTimelineChart(timelineData) {
    const canvas = document.getElementById('timelineChartCanvas');
    if (!canvas) return;

    if (timelineChartInstance) {
        timelineChartInstance.destroy();
    }

    const expConverted = timelineData.expense.map(v => convertCurrency(v, 'VND', currentCurrency));
    const incConverted = timelineData.income.map(v => convertCurrency(v, 'VND', currentCurrency));

    const ctx = canvas.getContext('2d');
    timelineChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: timelineData.labels,
            datasets: [
                {
                    label: t('type_expense'),
                    data: expConverted,
                    backgroundColor: 'rgba(255, 51, 68, 0.85)',
                    borderColor: '#ff3344',
                    borderWidth: 2,
                    borderRadius: 2
                },
                {
                    label: t('type_income'),
                    data: incConverted,
                    backgroundColor: 'rgba(0, 255, 102, 0.85)',
                    borderColor: '#00ff66',
                    borderWidth: 2,
                    borderRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 750, easing: 'easeOutQuart' },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#9990c0', font: { family: 'Pixelify Sans', size: 10 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.08)' },
                    ticks: {
                        color: '#9990c0',
                        font: { family: 'Pixelify Sans', size: 10 },
                        callback: function(v) {
                            if (currentCurrency === 'VND') {
                                if (v >= 1000000) return (v / 1000000) + 'Tr';
                                if (v >= 1000) return (v / 1000) + 'k';
                            } else {
                                if (v >= 1000) return (v / 1000) + 'k';
                            }
                            return v;
                        }
                    }
                }
            },
            plugins: {
                legend: { position: 'top', labels: { color: '#f0f0ff', font: { family: 'Be Vietnam Pro', size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            return ` ${ctx.dataset.label}: ${formatMoney(ctx.raw, currentCurrency)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderTopExpenses(topList) {
    const container = document.getElementById('topExpensesList');
    if (!container) return;
    container.innerHTML = '';

    if (!topList.length) {
        container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1rem;">${t('chart_empty')}</div>`;
        return;
    }

    topList.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'tx-item';
        div.style.padding = '0.5rem 0.8rem';
        const itemCurr = item.currency || 'VND';
        const displayNative = formatMoney(item.amount, itemCurr);
        const displayConverted = itemCurr !== currentCurrency ? ` (${formatMoney(convertCurrency(item.amount_vnd, 'VND', currentCurrency), currentCurrency)})` : '';

        div.innerHTML = `
            <div class="tx-item-left">
                <span style="font-family: var(--font-pixel); color: var(--color-accent); font-size: 0.8rem;">#${index + 1}</span>
                <span style="font-size: 1.2rem;">${item.category_icon || '🏷️'}</span>
                <div>
                    <div style="font-weight: 600; font-size: 0.85rem;">${item.note || getCategoryName(item.category_name)}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">
                        ${item.date} • ${getCategoryName(item.category_name)} 
                        ${item.wallet_name ? `• <span class="tx-wallet-tag">${item.wallet_name}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="tx-amount expense">${displayNative}<span style="font-size: 0.75rem; color: var(--text-muted);">${displayConverted}</span></div>
        `;
        container.appendChild(div);
    });
}

// 9. LOAD TRANSACTIONS LIST
async function loadTransactions() {
    try {
        const search = document.getElementById('searchTxInput')?.value || '';
        const catFilter = document.getElementById('filterCategory')?.value || '';
        const typeFilter = document.getElementById('filterType')?.value || '';
        const walletFilter = selectedWalletFilter || document.getElementById('filterWallet')?.value || '';
        const currFilter = document.getElementById('filterCurrency')?.value || '';

        let url = `/api/transactions?period=${currentPeriod}&search=${encodeURIComponent(search)}`;
        if (catFilter) url += `&category_id=${catFilter}`;
        if (typeFilter) url += `&type=${typeFilter}`;
        if (walletFilter) url += `&wallet_id=${walletFilter}`;
        if (currFilter) url += `&currency=${currFilter}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!data.success) return;

        const container = document.getElementById('transactionsList');
        if (!container) return;
        container.innerHTML = '';

        if (!data.transactions.length) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); font-family: var(--font-pixel); font-size: 0.8rem;">
                    ${t('no_transactions')}
                </div>
            `;
            return;
        }

        data.transactions.forEach(tx => {
            const item = document.createElement('div');
            item.className = 'tx-item';
            const isExpense = tx.type === 'expense';
            const sign = isExpense ? '-' : '+';
            const amountClass = isExpense ? 'expense' : 'income';
            const txCurr = tx.currency || 'VND';

            const nativeStr = `${sign}${formatMoney(tx.amount, txCurr)}`;
            const convertedStr = txCurr !== currentCurrency 
                ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">≈ ${formatMoney(convertCurrency(tx.amount_vnd, 'VND', currentCurrency), currentCurrency)}</div>` 
                : '';

            item.innerHTML = `
                <div class="tx-item-left">
                    <div class="tx-cat-icon">${tx.category_icon || '🏷️'}</div>
                    <div class="tx-details">
                        <div class="tx-title">
                            ${tx.note || getCategoryName(tx.category_name)}
                            <span class="currency-tag">${txCurr}</span>
                        </div>
                        <div class="tx-meta">
                            <span>📅 ${tx.date}</span>
                            <span>•</span>
                            <span>🏷️ ${getCategoryName(tx.category_name) || t('other')}</span>
                            <span>•</span>
                            <span class="tx-wallet-tag">💳 ${tx.wallet_name || tx.payment_method || t('wallet_badge_cash')}</span>
                        </div>
                    </div>
                </div>
                <div class="tx-item-right">
                    <div class="tx-amount ${amountClass}">
                        ${nativeStr}
                        ${convertedStr}
                    </div>
                    <div class="tx-actions">
                        <button class="pixel-btn pixel-btn-sm" onclick="editTransaction(${JSON.stringify(tx).replace(/"/g, '&quot;')})">✏️</button>
                        <button class="pixel-btn pixel-btn-sm pixel-btn-danger" onclick="deleteTransaction(${tx.id})">🗑️</button>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });

    } catch (e) {
        console.error('Error loading transactions:', e);
    }
}

// 10. LOAD SUBSCRIPTIONS & SERVICES
async function loadSubscriptions() {
    try {
        const res = await fetch('/api/subscriptions');
        const data = await res.json();
        if (!data.success) return;

        const totalMonthlyEl = document.getElementById('subTotalMonthly');
        const totalYearlyEl = document.getElementById('subTotalYearly');
        if (totalMonthlyEl) {
            const converted = convertCurrency(data.total_monthly_vnd, 'VND', currentCurrency);
            totalMonthlyEl.textContent = formatMoney(converted, currentCurrency);
        }
        if (totalYearlyEl) {
            const convertedYearly = convertCurrency(data.total_yearly_vnd, 'VND', currentCurrency);
            totalYearlyEl.textContent = formatMoney(convertedYearly, currentCurrency);
        }

        const container = document.getElementById('subscriptionsList');
        if (!container) return;
        container.innerHTML = '';

        if (!data.subscriptions.length) {
            container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 1.5rem;">${t('no_transactions')}</div>`;
            return;
        }

        data.subscriptions.forEach(sub => {
            const card = document.createElement('div');
            card.className = 'sub-card' + (sub.is_due_soon ? ' due-soon' : '');
            
            const badgeClass = sub.is_due_soon ? 'urgent' : 'normal';
            const bDay = sub.billing_day;
            const bMonth = sub.billing_month || 1;
            let daysText = '';
            if (sub.days_until_bill === 0) {
                daysText = t('sub_due_today');
            } else if (sub.cycle === 'yearly') {
                daysText = t('sub_days_left_yearly', { d: sub.days_until_bill, day: bDay, month: bMonth });
            } else {
                daysText = t('sub_days_left', { d: sub.days_until_bill, day: bDay });
            }
            const sCurr = sub.currency || 'VND';

            card.innerHTML = `
                <div class="sub-left">
                    <div class="sub-icon">${sub.category_icon || '📺'}</div>
                    <div>
                        <div class="sub-name">
                            ${sub.name}
                            <span class="currency-tag">${sCurr}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">
                            ${sub.note || (sub.cycle === 'monthly' ? t('sub_cycle_monthly') : t('sub_cycle_yearly'))}
                            ${sub.wallet_name ? ` • ${t('sub_debited_from')}: <span class="tx-wallet-tag">${sub.wallet_name}</span>` : ''}
                        </div>
                        <span class="sub-due-badge ${badgeClass}">${daysText}</span>
                    </div>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end;">
                    <div style="font-family: var(--font-pixel); font-weight: bold; color: var(--color-accent); font-size: 0.95rem;">
                        ${formatMoney(sub.amount, sCurr)}
                    </div>
                    <div style="display: flex; gap: 0.35rem;">
                        <button class="pixel-btn pixel-btn-sm pixel-btn-success" onclick="paySubscription(${sub.id})" title="${t('sub_btn_pay')}">
                            ${t('sub_btn_pay')}
                        </button>
                        <button class="pixel-btn pixel-btn-sm pixel-btn-primary" onclick="openEditSubModal(${sub.id})" title="${t('btn_edit') || 'Sửa'}">
                            ✏️
                        </button>
                        <button class="pixel-btn pixel-btn-sm pixel-btn-danger" onclick="deleteSubscription(${sub.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (e) {
        console.error('Error loading subscriptions:', e);
    }
}

// 11. ACTIONS: ADD / EDIT / DELETE TRANSACTIONS
function openAddTxModal(type = 'expense') {
    SoundEffects.playClick();
    currentEditingTxId = null;
    document.getElementById('txModalTitle').textContent = type === 'expense' ? t('modal_tx_expense_title') : t('modal_tx_income_title');
    document.getElementById('txAmount').value = '';
    document.getElementById('txNote').value = '';
    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];

    setTxModalCurrency(currentCurrency);
    setTypeSelection(type);
    populateCategorySelect(type);
    populateWalletSelects();

    document.getElementById('txModal').classList.add('active');
}

function setTxModalCurrency(curr) {
    document.querySelectorAll('.tx-curr-btn').forEach(b => {
        if (b.dataset.curr === curr) b.classList.add('active');
        else b.classList.remove('active');
    });
    const amountInput = document.getElementById('txAmount');
    if (curr === 'EUR') {
        amountInput.step = '0.01';
        amountInput.placeholder = '12.50 € (cents)';
    } else if (curr === 'USD') {
        amountInput.step = '0.01';
        amountInput.placeholder = '9.99 $ (cents)';
    } else {
        amountInput.step = '1000';
        amountInput.placeholder = '50000 ₫';
    }
}

function editTransaction(tx) {
    SoundEffects.playClick();
    currentEditingTxId = tx.id;
    document.getElementById('txModalTitle').textContent = t('modal_tx_edit_title');
    document.getElementById('txAmount').value = tx.amount;
    document.getElementById('txNote').value = tx.note || '';
    document.getElementById('txDate').value = tx.date;

    const tCurr = tx.currency || 'VND';
    setTxModalCurrency(tCurr);
    setTypeSelection(tx.type);
    populateCategorySelect(tx.type);
    populateWalletSelects();

    document.getElementById('txCategory').value = tx.category_id;
    if (tx.wallet_id) {
        document.getElementById('txWallet').value = tx.wallet_id;
    }

    document.getElementById('txModal').classList.add('active');
}

function setTypeSelection(type) {
    const btnExp = document.getElementById('typeExpenseBtn');
    const btnInc = document.getElementById('typeIncomeBtn');
    if (type === 'expense') {
        btnExp.classList.add('active', 'expense');
        btnInc.classList.remove('active', 'income');
    } else {
        btnInc.classList.add('active', 'income');
        btnExp.classList.remove('active', 'expense');
    }
    populateCategorySelect(type);
}

async function saveTransaction(event) {
    const amount = parseFloat(document.getElementById('txAmount').value);
    const activeCurrBtn = document.querySelector('.tx-curr-btn.active');
    const currency = activeCurrBtn ? activeCurrBtn.dataset.curr : 'VND';
    const isExpense = document.getElementById('typeExpenseBtn').classList.contains('active');
    const type = isExpense ? 'expense' : 'income';
    const category_id = parseInt(document.getElementById('txCategory').value);
    const wallet_id = parseInt(document.getElementById('txWallet').value) || null;
    const date = document.getElementById('txDate').value;
    const note = document.getElementById('txNote').value.trim();

    if (!amount || amount <= 0) {
        SoundEffects.playWarning();
        alert(t('alert_invalid_amount'));
        return;
    }

    const payload = { amount, currency, type, category_id, wallet_id, date, note };

    try {
        let res;
        if (currentEditingTxId) {
            res = await fetch(`/api/transactions/${currentEditingTxId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const data = await res.json();
        if (data.success) {
            SoundEffects.playCoin();
            const evt = event || window.event;
            const x = evt ? evt.clientX : window.innerWidth / 2;
            const y = evt ? evt.clientY : window.innerHeight / 2;
            triggerCoinBurst(x, y);

            closeModal('txModal');
            showToast(currentEditingTxId ? t('tx_updated') : t('tx_saved'), '💰');
            loadDashboard();
        } else {
            SoundEffects.playWarning();
            alert(data.message);
        }
    } catch (e) {
        console.error('Save error:', e);
    }
}

async function deleteTransaction(txId) {
    if (!confirm(t('confirm_delete_tx'))) return;
    try {
        const res = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playDelete();
            showToast(t('tx_deleted'), '🗑️');
            loadDashboard();
        }
    } catch (e) {
        console.error(e);
    }
}

// 12. ACTIONS: DEPOSIT MONEY (NẠP / THÊM TIỀN)
function openDepositModal(walletId = null) {
    SoundEffects.playClick();
    populateCategorySelect('income');
    populateWalletSelects();

    if (walletId) {
        document.getElementById('depositWallet').value = walletId;
        updateDepositCurrencyHint(walletId);
    } else {
        updateDepositCurrencyHint(document.getElementById('depositWallet')?.value);
    }

    document.getElementById('depositAmount').value = '';
    document.getElementById('depositNote').value = '';
    document.getElementById('depositDate').value = new Date().toISOString().split('T')[0];

    document.getElementById('depositModal').classList.add('active');
}

function updateDepositCurrencyHint(walletId) {
    const w = walletsList.find(x => x.id == walletId);
    const curr = w ? w.currency : 'VND';
    const amountInput = document.getElementById('depositAmount');
    const hint = document.getElementById('depositCurrencyHint');
    if (hint) hint.textContent = `${t('label_currency')}: ${curr}`;
    if (amountInput) {
        if (curr === 'EUR' || curr === 'USD') {
            amountInput.step = '0.01';
            amountInput.placeholder = curr === 'EUR' ? '50.50 €' : '100.00 $';
        } else {
            amountInput.step = '10000';
            amountInput.placeholder = '1000000 ₫';
        }
    }
}

async function saveDeposit(event) {
    const wallet_id = parseInt(document.getElementById('depositWallet').value);
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const category_id = parseInt(document.getElementById('depositCategory').value);
    const date = document.getElementById('depositDate').value;
    const note = document.getElementById('depositNote').value.trim();

    if (!amount || amount <= 0) {
        SoundEffects.playWarning();
        alert(t('alert_invalid_amount'));
        return;
    }

    try {
        const res = await fetch(`/api/wallets/${wallet_id}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, category_id, date, note })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            const evt = event || window.event;
            const x = evt ? evt.clientX : window.innerWidth / 2;
            const y = evt ? evt.clientY : window.innerHeight / 2;
            triggerCoinBurst(x, y);

            closeModal('depositModal');
            showToast(t('deposit_success') || data.message, '💵');
            loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

// 13. ACTIONS: TRANSFER BETWEEN WALLETS (CHUYỂN TIỀN)
function openTransferModal() {
    SoundEffects.playClick();
    populateWalletSelects();
    document.getElementById('transferAmount').value = '';
    document.getElementById('transferNote').value = '';
    document.getElementById('transferDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('transferModal').classList.add('active');
}

async function saveTransfer(event) {
    const from_wallet_id = parseInt(document.getElementById('transferFromWallet').value);
    const to_wallet_id = parseInt(document.getElementById('transferToWallet').value);
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const date = document.getElementById('transferDate').value;
    const note = document.getElementById('transferNote').value.trim();

    if (from_wallet_id === to_wallet_id) {
        SoundEffects.playWarning();
        alert(t('alert_transfer_same_wallet'));
        return;
    }
    if (!amount || amount <= 0) {
        SoundEffects.playWarning();
        alert(t('alert_invalid_amount'));
        return;
    }

    try {
        const res = await fetch('/api/wallets/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from_wallet_id, to_wallet_id, amount, date, note })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playCoin();
            const evt = event || window.event;
            const x = evt ? evt.clientX : window.innerWidth / 2;
            const y = evt ? evt.clientY : window.innerHeight / 2;
            triggerCoinBurst(x, y);

            closeModal('transferModal');
            showToast(t('transfer_success') || data.message, '🔄');
            loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

// 14. ACTIONS: CREATE NEW WALLET
function openAddWalletModal() {
    SoundEffects.playClick();
    document.getElementById('walletName').value = '';
    document.getElementById('walletType').value = 'bank';
    document.getElementById('walletCurrency').value = currentCurrency;
    document.getElementById('walletInitialBal').value = '0';
    document.getElementById('walletIcon').value = '🏦';
    document.getElementById('walletColor').value = '#00f0ff';
    document.getElementById('walletNote').value = '';
    document.getElementById('walletModal').classList.add('active');
}

async function saveNewWallet() {
    const name = document.getElementById('walletName').value.trim();
    const type = document.getElementById('walletType').value;
    const currency = document.getElementById('walletCurrency').value;
    const initial_balance = parseFloat(document.getElementById('walletInitialBal').value || 0);
    const icon = document.getElementById('walletIcon').value.trim() || '💳';
    const color = document.getElementById('walletColor').value;
    const note = document.getElementById('walletNote').value.trim();

    if (!name) {
        alert(t('alert_enter_wallet_name'));
        return;
    }

    try {
        const res = await fetch('/api/wallets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, currency, initial_balance, icon, color, note })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            closeModal('walletModal');
            showToast(t('wallet_created'), '💼');
            loadWallets();
        }
    } catch (e) {
        console.error(e);
    }
}

// 15. CURRENCY CONVERTER MODAL
function openConverterModal() {
    SoundEffects.playClick();
    loadRates();
    document.getElementById('converterModal').classList.add('active');
    updateConverterCalculations();
}

function updateConverterCalculations() {
    const amount = parseFloat(document.getElementById('convertAmountInput')?.value || 100);
    const fromCurr = document.getElementById('convertFromSelect')?.value || 'EUR';

    const inVND = convertCurrency(amount, fromCurr, 'VND');
    const inEUR = convertCurrency(amount, fromCurr, 'EUR');
    const inUSD = convertCurrency(amount, fromCurr, 'USD');

    const resVND = document.getElementById('resVND');
    const resEUR = document.getElementById('resEUR');
    const resUSD = document.getElementById('resUSD');

    if (resVND) resVND.textContent = formatMoney(inVND, 'VND');
    if (resEUR) resEUR.textContent = formatMoney(inEUR, 'EUR');
    if (resUSD) resUSD.textContent = formatMoney(inUSD, 'USD');
}

async function syncRatesOnline() {
    SoundEffects.playClick();
    const btn = document.getElementById('syncRatesBtn');
    if (btn) btn.textContent = '⏳ ...';
    try {
        const res = await fetch('/api/rates/sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            showToast(t('rates_synced') || data.message, '🌐');
            if (data.rates) {
                exchangeRates = { ...exchangeRates, ...data.rates };
                document.getElementById('rateUsdInput').value = exchangeRates.USD_VND;
                document.getElementById('rateEurInput').value = exchangeRates.EUR_VND;
                updateConverterCalculations();
                loadDashboard();
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        if (btn) btn.textContent = t('btn_sync_online');
    }
}

async function saveCustomRates() {
    const rate_USD_VND = parseFloat(document.getElementById('rateUsdInput').value);
    const rate_EUR_VND = parseFloat(document.getElementById('rateEurInput').value);

    try {
        const res = await fetch('/api/rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rate_USD_VND, rate_EUR_VND })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            exchangeRates.USD_VND = rate_USD_VND;
            exchangeRates.EUR_VND = rate_EUR_VND;
            updateConverterCalculations();
            showToast(t('rates_saved'), '💾');
            loadDashboard();
        }
    } catch (e) {
        console.error(e);
    }
}

// === TODAY DATE DISPLAY FUNCTION ===
function updateTodayDisplay() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayOfWeek = today.getDay(); // 0 is Sunday

    const dowVi = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
    const dowEn = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dowDe = ['SONNTAG', 'MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG'];

    let dowText = dowVi[dayOfWeek];
    let dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    let fullModalText = `${dowVi[dayOfWeek]}, ngày ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    if (typeof currentLang !== 'undefined' && currentLang === 'en') {
        dowText = dowEn[dayOfWeek];
        const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        dateStr = `${String(day).padStart(2, '0')} ${monthNamesEn[month - 1]} ${year}`;
        fullModalText = `${dowEn[dayOfWeek]}, ${monthNamesEn[month - 1]} ${day}, ${year}`;
    } else if (typeof currentLang !== 'undefined' && currentLang === 'de') {
        dowText = dowDe[dayOfWeek];
        const monthNamesDe = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        dateStr = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
        fullModalText = `${dowDe[dayOfWeek]}, ${day}. ${monthNamesDe[month - 1]} ${year}`;
    }

    const dowEl = document.getElementById('headerTodayDow');
    const dateEl = document.getElementById('headerTodayDate');
    const modalTextEl = document.getElementById('subModalTodayText');

    if (dowEl) dowEl.textContent = dowText;
    if (dateEl) dateEl.textContent = dateStr;
    if (modalTextEl) modalTextEl.textContent = fullModalText;
}

// === PIXEL CALENDAR TABLE PICKER FOR SUBSCRIPTION BILLING DAY ===
let currentSubCalDate = new Date();

function formatCalMonthYear(year, monthIndex) {
    const monthNum = monthIndex + 1;
    if (typeof currentLang !== 'undefined' && currentLang === 'vi') {
        return `THÁNG ${monthNum} / ${year}`;
    } else if (typeof currentLang !== 'undefined' && currentLang === 'de') {
        const monthNamesDe = ['JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI', 'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'];
        return `${monthNamesDe[monthIndex]} ${year}`;
    } else {
        const monthNamesEn = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        return `${monthNamesEn[monthIndex]} ${year}`;
    }
}

function renderSubCalendarTable(targetDate = null, selectedDay = null) {
    if (targetDate) {
        currentSubCalDate = new Date(targetDate);
    }
    const year = currentSubCalDate.getFullYear();
    const month = currentSubCalDate.getMonth(); // 0-indexed

    if (selectedDay === null) {
        selectedDay = parseInt(document.getElementById('subDay')?.value || 1);
    }

    // Update month/year title
    const titleEl = document.getElementById('subCalMonthTitle');
    if (titleEl) {
        titleEl.textContent = formatCalMonthYear(year, month);
    }

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Day of week of 1st day (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    // Convert so Monday = 0, Tuesday = 1, ..., Sunday = 6
    const startCol = (firstDayOfWeek + 6) % 7;

    // Today's date check
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDay = isCurrentMonth ? today.getDate() : -1;

    const tbody = document.getElementById('subCalTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let dayCounter = 1;
    let row = document.createElement('tr');

    // Previous month filler cells
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = 0; i < startCol; i++) {
        const td = document.createElement('td');
        const prevDayNum = prevMonthDays - startCol + 1 + i;
        td.innerHTML = `<button type="button" class="cal-day-cell is-other-month" tabindex="-1">${prevDayNum}</button>`;
        row.appendChild(td);
    }

    while (dayCounter <= daysInMonth) {
        if (row.children.length === 7) {
            tbody.appendChild(row);
            row = document.createElement('tr');
        }

        const td = document.createElement('td');
        const day = dayCounter;
        const isSelected = (day === selectedDay);
        const isToday = (day === todayDay);

        let cellClasses = ['cal-day-cell'];
        if (isSelected) cellClasses.push('is-selected');
        if (isToday) cellClasses.push('is-today');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = cellClasses.join(' ');
        btn.textContent = day;
        btn.setAttribute('data-day', day);
        if (isToday) {
            btn.title = t('cal_today_title', { day });
        }
        btn.onclick = () => selectSubBillingDay(day, month + 1);

        td.appendChild(btn);
        row.appendChild(td);
        dayCounter++;
    }

    // Next month filler cells to complete the 7-column row
    let nextDayCounter = 1;
    while (row.children.length < 7 && row.children.length > 0) {
        const td = document.createElement('td');
        td.innerHTML = `<button type="button" class="cal-day-cell is-other-month" tabindex="-1">${nextDayCounter++}</button>`;
        row.appendChild(td);
    }
    if (row.children.length > 0) {
        tbody.appendChild(row);
    }

    updateSelectedSubDayBadge(selectedDay, month + 1);
}

function selectSubBillingDay(day, month = null) {
    day = Math.max(1, Math.min(31, parseInt(day) || 1));
    if (month === null) {
        month = currentSubCalDate.getMonth() + 1;
    } else {
        month = Math.max(1, Math.min(12, parseInt(month) || 1));
    }

    SoundEffects.playClick();
    const inputDay = document.getElementById('subDay');
    const inputMonth = document.getElementById('subMonth');
    if (inputDay) inputDay.value = day;
    if (inputMonth) inputMonth.value = month;

    // Update active class on table cells
    document.querySelectorAll('#subCalTableBody .cal-day-cell').forEach(btn => {
        if (parseInt(btn.getAttribute('data-day')) === day) {
            btn.classList.add('is-selected');
        } else {
            btn.classList.remove('is-selected');
        }
    });

    // Update preset buttons active state
    document.querySelectorAll('#subCalPresetsMonthly .pixel-preset-btn').forEach(pBtn => {
        const presetDay = parseInt(pBtn.getAttribute('data-preset-day'));
        if (presetDay === day) {
            pBtn.classList.add('active');
        } else {
            pBtn.classList.remove('active');
        }
    });

    updateSelectedSubDayBadge(day, month);
}

function updateSelectedSubDayBadge(day, month = null) {
    const cycle = document.getElementById('subCycle')?.value || 'monthly';
    if (month === null) {
        month = currentSubCalDate ? (currentSubCalDate.getMonth() + 1) : 1;
    }
    const textEl = document.getElementById('subSelectedDayText');
    if (!textEl) return;

    if (cycle === 'yearly') {
        textEl.textContent = t('cal_selected_day_yearly_label', { day, month });
    } else {
        textEl.textContent = t('cal_selected_day_label', { day });
    }
}

function navSubCalendarMonth(offset) {
    SoundEffects.playClick();
    currentSubCalDate.setMonth(currentSubCalDate.getMonth() + offset);
    const month = currentSubCalDate.getMonth() + 1;
    const dayInput = document.getElementById('subDay');
    const monthInput = document.getElementById('subMonth');
    if (monthInput) monthInput.value = month;
    const currentDay = parseInt(dayInput?.value || 1);
    renderSubCalendarTable(currentSubCalDate, currentDay);
    updateSelectedSubDayBadge(currentDay, month);
}

function handleSubCycleChange() {
    SoundEffects.playClick();
    const cycle = document.getElementById('subCycle')?.value || 'monthly';
    const label = document.getElementById('labelSubDaySchedule');
    const presetsMonthly = document.getElementById('subCalPresetsMonthly');
    const presetsYearly = document.getElementById('subCalPresetsYearly');

    if (cycle === 'yearly') {
        if (label) label.textContent = t('label_sub_day_yearly');
        if (presetsMonthly) presetsMonthly.style.display = 'none';
        if (presetsYearly) presetsYearly.style.display = 'flex';
    } else {
        if (label) label.textContent = t('label_sub_day');
        if (presetsMonthly) presetsMonthly.style.display = 'flex';
        if (presetsYearly) presetsYearly.style.display = 'none';
    }

    const day = parseInt(document.getElementById('subDay')?.value || 1);
    const month = parseInt(document.getElementById('subMonth')?.value || (currentSubCalDate.getMonth() + 1));
    updateSelectedSubDayBadge(day, month);
}

function pickTodayAsBillingDate() {
    SoundEffects.playCoin();
    const today = new Date();
    currentSubCalDate = new Date(today);
    const day = today.getDate();
    const month = today.getMonth() + 1;

    const dayInput = document.getElementById('subDay');
    const monthInput = document.getElementById('subMonth');
    if (dayInput) dayInput.value = day;
    if (monthInput) monthInput.value = month;

    renderSubCalendarTable(today, day);
    selectSubBillingDay(day, month);
}

function selectYearlyPreset(day, month) {
    SoundEffects.playClick();
    const targetDate = new Date(currentSubCalDate.getFullYear(), month - 1, day);
    currentSubCalDate = targetDate;
    const dayInput = document.getElementById('subDay');
    const monthInput = document.getElementById('subMonth');
    if (dayInput) dayInput.value = day;
    if (monthInput) monthInput.value = month;

    renderSubCalendarTable(targetDate, day);
    selectSubBillingDay(day, month);
}

// 16. ACTIONS: SUBSCRIPTIONS
function openAddSubModal() {
    SoundEffects.playClick();
    currentEditingSubId = null;

    const titleEl = document.getElementById('subModalTitle');
    if (titleEl) titleEl.textContent = t('modal_sub_title');
    const submitBtn = document.getElementById('btnSaveSubscription');
    if (submitBtn) submitBtn.innerHTML = `➕ ${t('btn_add_sub_confirm')}`;

    document.getElementById('subName').value = '';
    document.getElementById('subAmount').value = '';
    document.getElementById('subCurrency').value = currentCurrency;
    document.getElementById('subCycle').value = 'monthly';
    const today = new Date();
    currentSubCalDate = new Date(today);
    const defaultDay = today.getDate();
    const defaultMonth = today.getMonth() + 1;
    document.getElementById('subDay').value = defaultDay;
    if (document.getElementById('subMonth')) {
        document.getElementById('subMonth').value = defaultMonth;
    }
    document.getElementById('subNote').value = '';
    populateWalletSelects();
    populateCategorySelect('expense');
    handleSubCycleChange();
    renderSubCalendarTable(today, defaultDay);
    selectSubBillingDay(defaultDay, defaultMonth);
    updateTodayDisplay();
    document.getElementById('subModal').classList.add('active');
}

async function openEditSubModal(subId) {
    SoundEffects.playClick();
    currentEditingSubId = subId;

    try {
        const res = await fetch(`/api/subscriptions/${subId}`);
        const data = await res.json();
        if (!data.success || !data.subscription) {
            showToast('Không tìm thấy thông tin dịch vụ!', '⚠️');
            return;
        }
        const sub = data.subscription;

        const titleEl = document.getElementById('subModalTitle');
        if (titleEl) titleEl.textContent = t('modal_sub_edit_title');
        const submitBtn = document.getElementById('btnSaveSubscription');
        if (submitBtn) submitBtn.innerHTML = `💾 ${t('btn_save_changes')}`;

        document.getElementById('subName').value = sub.name || '';
        document.getElementById('subAmount').value = sub.amount || '';
        document.getElementById('subCurrency').value = sub.currency || 'VND';
        document.getElementById('subCycle').value = sub.cycle || 'monthly';
        
        populateWalletSelects();
        populateCategorySelect('expense');
        
        if (sub.wallet_id) document.getElementById('subWallet').value = sub.wallet_id;
        if (sub.category_id) document.getElementById('subCategory').value = sub.category_id;
        document.getElementById('subNote').value = sub.note || '';

        const sDay = sub.billing_day || 1;
        const sMonth = sub.billing_month || (new Date().getMonth() + 1);
        document.getElementById('subDay').value = sDay;
        if (document.getElementById('subMonth')) {
            document.getElementById('subMonth').value = sMonth;
        }

        currentSubCalDate = new Date(new Date().getFullYear(), sMonth - 1, 1);
        handleSubCycleChange();
        renderSubCalendarTable(currentSubCalDate, sDay);
        selectSubBillingDay(sDay, sMonth);
        updateTodayDisplay();

        document.getElementById('subModal').classList.add('active');
    } catch (e) {
        console.error('Error opening edit subscription modal:', e);
    }
}

async function saveSubscription() {
    const name = document.getElementById('subName').value.trim();
    const amount = parseFloat(document.getElementById('subAmount').value);
    const currency = document.getElementById('subCurrency').value;
    const cycle = document.getElementById('subCycle').value;
    const billing_day = parseInt(document.getElementById('subDay').value);
    const billing_month = parseInt(document.getElementById('subMonth')?.value || (currentSubCalDate.getMonth() + 1));
    const category_id = parseInt(document.getElementById('subCategory').value);
    const wallet_id = parseInt(document.getElementById('subWallet').value);
    const note = document.getElementById('subNote').value.trim();

    if (!name || !amount || amount <= 0) {
        SoundEffects.playWarning();
        alert(t('alert_enter_sub_details'));
        return;
    }

    const url = currentEditingSubId ? `/api/subscriptions/${currentEditingSubId}` : '/api/subscriptions';
    const method = currentEditingSubId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, amount, currency, cycle, billing_day, billing_month, category_id, wallet_id, note })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            closeModal('subModal');
            showToast(currentEditingSubId ? t('sub_updated') : t('sub_saved'), '📺');
            currentEditingSubId = null;
            loadSubscriptions();
            loadBudgetHealth();
        } else {
            alert(data.message || 'Lỗi lưu dịch vụ!');
        }
    } catch (e) {
        console.error(e);
    }
}

async function paySubscription(subId) {
    try {
        const res = await fetch(`/api/subscriptions/${subId}/pay`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playCoin();
            triggerCoinBurst(window.innerWidth / 2, window.innerHeight / 2);
            showToast(t('sub_paid') || data.message, '⚡');
            loadDashboard();
        }
    } catch (e) {
        console.error(e);
    }
}

async function deleteSubscription(subId) {
    if (!confirm(t('confirm_delete_sub'))) return;
    try {
        const res = await fetch(`/api/subscriptions/${subId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playDelete();
            showToast(t('sub_deleted'), '🗑️');
            loadSubscriptions();
            loadBudgetHealth();
        }
    } catch (e) {
        console.error(e);
    }
}

// 17. BUDGET SETTINGS MODAL
function setBudgetIncomeType(type) {
    SoundEffects.playClick();
    currentBudgetIncomeType = type;
    const btnVariable = document.getElementById('btnIncomeTypeVariable');
    const btnFixed = document.getElementById('btnIncomeTypeFixed');
    const hint = document.getElementById('variableIncomeHint');
    const groupRunway = document.getElementById('groupRunwayTarget');
    const groupSavings = document.getElementById('groupSavingsPct');

    if (type === 'variable') {
        if (btnVariable) btnVariable.classList.add('active');
        if (btnFixed) btnFixed.classList.remove('active');
        if (hint) hint.style.display = 'block';
        if (groupRunway) groupRunway.style.display = 'block';
        if (groupSavings) groupSavings.style.display = 'none';
    } else {
        if (btnFixed) btnFixed.classList.add('active');
        if (btnVariable) btnVariable.classList.remove('active');
        if (hint) hint.style.display = 'none';
        if (groupRunway) groupRunway.style.display = 'none';
        if (groupSavings) groupSavings.style.display = 'block';
    }
    updateBudgetModalDisplay();
}

function setBudgetModalCurrency(curr) {
    const oldCurr = currentBudgetModalCurrency || 'VND';
    currentBudgetModalCurrency = curr;

    document.querySelectorAll('.budget-curr-btn').forEach(b => {
        if (b.dataset.curr === curr) b.classList.add('active');
        else b.classList.remove('active');
    });

    const incInput = document.getElementById('setExpectedIncome');
    const bgtInput = document.getElementById('setMonthlyBudget');

    if (curr === 'EUR' || curr === 'USD') {
        if (incInput) { incInput.step = '0.01'; incInput.placeholder = curr === 'EUR' ? '650.00 €' : '750.00 $'; }
        if (bgtInput) { bgtInput.step = '0.01'; bgtInput.placeholder = curr === 'EUR' ? '450.00 €' : '500.00 $'; }
    } else {
        if (incInput) { incInput.step = '10000'; incInput.placeholder = '18000000 ₫'; }
        if (bgtInput) { bgtInput.step = '10000'; bgtInput.placeholder = '12000000 ₫'; }
    }

    updateBudgetModalDisplay();

    // Convert values currently in the inputs if user switches currency on the fly
    if (incInput && incInput.value) {
        const val = parseFloat(incInput.value);
        if (!isNaN(val) && val > 0) {
            const converted = convertCurrency(val, oldCurr, curr);
            incInput.value = (curr === 'VND') ? Math.round(converted) : Number(converted.toFixed(2));
        }
    }
    if (bgtInput && bgtInput.value) {
        const val = parseFloat(bgtInput.value);
        if (!isNaN(val) && val > 0) {
            const converted = convertCurrency(val, oldCurr, curr);
            bgtInput.value = (curr === 'VND') ? Math.round(converted) : Number(converted.toFixed(2));
        }
    }
}

function updateBudgetModalDisplay() {
    const lblInc = document.getElementById('labelExpectedIncome');
    const lblBgt = document.getElementById('labelMonthlyBudget');
    const curr = currentBudgetModalCurrency || currentCurrency || 'VND';
    if (lblInc) {
        const optText = t('income_optional') || '(Tùy chọn)';
        lblInc.textContent = (currentBudgetIncomeType === 'variable') 
            ? `${t('label_expected_income')} [${curr}] ${optText}`
            : `${t('label_expected_income')} [${curr}]`;
    }
    if (lblBgt) lblBgt.textContent = `${t('label_monthly_budget')} [${curr}]`;
}

function openBudgetModal() {
    SoundEffects.playClick();
    
    // Default budget modal currency to current dashboard currency
    currentBudgetModalCurrency = currentCurrency || 'VND';
    
    document.querySelectorAll('.budget-curr-btn').forEach(b => {
        if (b.dataset.curr === currentBudgetModalCurrency) b.classList.add('active');
        else b.classList.remove('active');
    });

    const incInput = document.getElementById('setExpectedIncome');
    const bgtInput = document.getElementById('setMonthlyBudget');
    const pctInput = document.getElementById('setSavingsPct');
    const runwaySelect = document.getElementById('setRunwayTarget');

    if (currentBudgetModalCurrency === 'EUR' || currentBudgetModalCurrency === 'USD') {
        if (incInput) { incInput.step = '0.01'; incInput.placeholder = currentBudgetModalCurrency === 'EUR' ? '650.00 €' : '750.00 $'; }
        if (bgtInput) { bgtInput.step = '0.01'; bgtInput.placeholder = currentBudgetModalCurrency === 'EUR' ? '450.00 €' : '500.00 $'; }
    } else {
        if (incInput) { incInput.step = '10000'; incInput.placeholder = '18000000 ₫'; }
        if (bgtInput) { bgtInput.step = '10000'; bgtInput.placeholder = '12000000 ₫'; }
    }

    if (savedBudgetVnd) {
        setBudgetIncomeType(savedBudgetVnd.income_type || 'variable');
        if (runwaySelect) runwaySelect.value = String(Math.round(savedBudgetVnd.runway_target_months || 6));

        const expConverted = convertCurrency(savedBudgetVnd.expected_income, 'VND', currentBudgetModalCurrency);
        const bgtConverted = convertCurrency(savedBudgetVnd.monthly_budget, 'VND', currentBudgetModalCurrency);
        if (incInput) incInput.value = (currentBudgetModalCurrency === 'VND') ? Math.round(expConverted) : Number(expConverted.toFixed(2));
        if (bgtInput) bgtInput.value = (currentBudgetModalCurrency === 'VND') ? Math.round(bgtConverted) : Number(bgtConverted.toFixed(2));
        if (pctInput) pctInput.value = savedBudgetVnd.savings_target_pct || 25;
    } else {
        setBudgetIncomeType('variable');
    }

    updateBudgetModalDisplay();
    document.getElementById('budgetModal').classList.add('active');
}

async function saveBudgetSettings() {
    const income_type = currentBudgetIncomeType || 'variable';
    const rawBudget = parseFloat(document.getElementById('setMonthlyBudget').value);
    const rawIncome = parseFloat(document.getElementById('setExpectedIncome').value) || 0;
    const runway_target_months = parseFloat(document.getElementById('setRunwayTarget')?.value) || 6.0;
    const savings_target_pct = parseFloat(document.getElementById('setSavingsPct')?.value) || 25.0;

    if (isNaN(rawBudget) || rawBudget <= 0) {
        SoundEffects.playWarning();
        alert(t('alert_enter_budget_details'));
        return;
    }

    if (income_type === 'fixed' && (isNaN(rawIncome) || rawIncome <= 0)) {
        SoundEffects.playWarning();
        alert(t('alert_enter_budget_details'));
        return;
    }

    // Convert input amounts from modal currency to base VND for SQLite database
    const expected_income = convertCurrency(rawIncome, currentBudgetModalCurrency, 'VND');
    const monthly_budget = convertCurrency(rawBudget, currentBudgetModalCurrency, 'VND');

    try {
        const res = await fetch('/api/budget/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                income_type, 
                runway_target_months, 
                expected_income, 
                monthly_budget, 
                savings_target_pct 
            })
        });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            savedBudgetVnd = { 
                income_type, 
                runway_target_months, 
                expected_income, 
                monthly_budget, 
                savings_target_pct 
            };
            closeModal('budgetModal');
            showToast(t('budget_updated'), '🎯');
            loadBudgetHealth();
            loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

// 18. BACKUP & EXPORT
function openBackupModal() {
    SoundEffects.playClick();
    document.getElementById('backupModal').classList.add('active');
}

async function handleImportJson(input) {
    if (!input.files || !input.files[0]) return;
    const formData = new FormData();
    formData.append('file', input.files[0]);

    try {
        const res = await fetch('/api/backup/import_json', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            SoundEffects.playSuccess();
            showToast(t('backup_restored'), '🔄');
            closeModal('backupModal');
            loadDashboard();
        } else {
            alert(data.message);
        }
    } catch (e) {
        console.error(e);
    }
}

// 19. EVENT LISTENERS
function setupEventListeners() {
    document.querySelectorAll('.period-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            SoundEffects.playClick();
            document.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentPeriod = pill.dataset.period;
            loadAnalytics();
            loadTransactions();
        });
    });

    document.getElementById('searchTxInput')?.addEventListener('input', () => loadTransactions());
    document.getElementById('filterCategory')?.addEventListener('change', () => loadTransactions());
    document.getElementById('filterType')?.addEventListener('change', () => loadTransactions());
    document.getElementById('filterCurrency')?.addEventListener('change', () => loadTransactions());
    document.getElementById('filterWallet')?.addEventListener('change', (e) => {
        selectedWalletFilter = e.target.value || null;
        renderWalletsGrid(walletsList);
        loadTransactions();
    });

    document.getElementById('convertAmountInput')?.addEventListener('input', updateConverterCalculations);
    document.getElementById('convertFromSelect')?.addEventListener('change', updateConverterCalculations);

    document.getElementById('depositWallet')?.addEventListener('change', (e) => {
        updateDepositCurrencyHint(e.target.value);
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
}

function closeModal(modalId) {
    SoundEffects.playClick();
    document.getElementById(modalId)?.classList.remove('active');
}
