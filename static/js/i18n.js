// === PIXEL MONEY - INTERNATIONALIZATION (i18n) ===
// Supported Languages: Tiếng Việt (vi), English (en), Deutsch (de)

const i18nData = {
    vi: {
        app_title: "VÍ TIỀN PIXEL",
        app_subtitle: "HỆ THỐNG QUẢN LÝ TÀI CHÍNH ĐA TIỀN TỆ (EUR • USD • VNĐ)",
        currency_display_label: "TIỀN TỆ:",
        lang_label: "NGÔN NGỮ:",
        
        // Header buttons
        btn_deposit: "⚡ NẠP TIỀN",
        btn_transfer: "🔄 CHUYỂN TIỀN",
        btn_rates: "💱 TỶ GIÁ",
        btn_expense: "➕ CHI TIÊU",
        btn_income: "➕ THU NHẬP",
        btn_budget: "🎯 HẠN MỨC",
        btn_excel: "💾 EXCEL / SAO LƯU",
        btn_sound_on: "🔊 BẬT ÂM",
        btn_sound_off: "🔇 TẮT ÂM",

        // Financial Health & NPC
        health_title: "❤️ CHỈ SỐ SỨC KHỎE TÀI CHÍNH (NGÂN SÁCH THÁNG)",
        npc_name: "HIỆP SĨ TÀI CHÍNH",
        npc_advice_label: "LỜI KHUYÊN HÔM NAY:",
        btn_edit_budget: "⚙️ ĐỔI NGÂN SÁCH",
        status_safe: "CHI TIÊU RẤT AN TOÀN!",
        status_warning: "CẦN CHÚ Ý CHI TIÊU",
        status_danger: "BÁO ĐỘNG NGÂN SÁCH!",
        npc_advice_safe: "Hôm nay bạn còn hạn mức tiêu an toàn là {amount}. Tốc độ chi tiêu rất tốt, tiếp tục giữ vững nhé!",
        npc_advice_warning: "Hôm nay nên chi tiêu trong khoảng {amount} để đảm bảo không chạm đáy ngân sách cuối tháng.",
        npc_advice_danger: "Cảnh báo: Bạn chỉ còn {rem} cho {days} ngày còn lại ({amount}/ngày). Hãy cắt giảm tối đa các khoản ngoài lề!",

        // Wallets
        wallets_title: "💼 CÁC NGUỒN TIỀN & VÍ CỦA BẠN (ĐA TIỀN TỆ)",
        wallets_hint: "(Nhấp vào ví để lọc giao dịch theo nguồn)",
        btn_add_wallet: "➕ Thêm Ví Mới",
        btn_quick_deposit: "➕ Nạp",
        btn_delete_wallet: "Xóa nguồn tiền này",
        confirm_delete_wallet: "Bạn có chắc chắn muốn xóa nguồn tiền \"{name}\"?\n(Các giao dịch liên quan sẽ được giữ lại an toàn)",
        wallet_deleted: "Đã xóa nguồn tiền thành công!",
        wallets_empty_msg: "Chưa có nguồn tiền/ví nào! Hãy tạo ví để quản lý số dư và phân loại dòng tiền.",
        btn_reset_default_wallets: "🔄 Khôi phục ví mẫu mặc định",
        no_wallet_selected: "Không chọn ví / Tiền mặt",
        total_assets: "Tổng Tài Sản (Các Ví)",
        total_assets_sub: "Tổng số dư khả dụng thực tế",

        // Wallet types full & badges
        wallet_type_bank: "🏦 Tài khoản Ngân hàng",
        wallet_type_cash: "💵 Tiền mặt",
        wallet_type_ewallet: "📱 Ví điện tử",
        wallet_type_credit: "💳 Thẻ tín dụng",
        wallet_type_savings: "🐷 Tiết kiệm / Heo đất",
        wallet_badge_bank: "Ngân hàng",
        wallet_badge_cash: "Tiền mặt",
        wallet_badge_ewallet: "Ví điện tử",
        wallet_badge_credit: "Tín dụng",
        wallet_badge_savings: "Tiết kiệm",

        // KPI Cards
        kpi_safe_daily: "Hạn Mức Hôm Nay",
        kpi_safe_daily_sub: "Mức chi tối đa an toàn mỗi ngày",
        kpi_expense: "Tổng Chi Tiêu",
        kpi_income: "Tổng Thu Nhập",
        kpi_income_sub: "Các nguồn thu đã nhận",
        kpi_balance: "Số Dư Dòng Tiền",
        kpi_balance_sub: "Thu nhập - Chi tiêu kỳ này",

        // Period tabs
        period_title: "📊 KHOẢNG THỜI GIAN THỐNG KÊ",
        period_day: "Hôm Nay",
        period_week: "Tuần Này",
        period_month: "Tháng Này",
        period_year: "Năm Nay",
        period_all: "Tất Cả",

        // Charts & Top Expenses
        chart_title: "📈 BIỂU ĐỒ PHÂN TÍCH CHI TIÊU",
        btn_export_excel_sm: "📥 Xuất Báo Cáo Excel",
        chart_cat: "🍩 THEO DANH MỤC",
        chart_timeline: "📊 BIẾN ĐỘNG DÒNG TIỀN",
        chart_empty: "👾 Chưa có khoản chi nào trong kỳ này!",
        top_expenses_title: "🏆 TOP 5 KHOẢN CHI LỚN NHẤT",

        // Transactions list & filters
        tx_title: "📜 LỊCH SỬ THU CHI & NGUỒN TIỀN",
        search_placeholder: "🔍 Tìm kiếm ghi chú...",
        filter_all_cats: "Tất cả danh mục",
        filter_all_wallets: "Tất cả nguồn tiền",
        filter_all_currencies: "Tất cả tiền tệ",
        filter_all_types: "Tất cả loại",
        type_expense: "Chi tiêu",
        type_income: "Thu nhập",
        no_transactions: "🕹️ Không tìm thấy giao dịch nào phù hợp!",
        confirm_delete_tx: "Bạn có chắc muốn xóa giao dịch này?",
        tx_deleted: "Đã xóa giao dịch thành công!",

        // Subscriptions
        sub_title: "📺 DỊCH VỤ ĐỊNH KỲ & ĐĂNG KÝ THÁNG",
        btn_add_sub: "➕ THÊM",
        sub_monthly_total: "Tổng chi phí cố định/tháng",
        sub_yearly_total: "Tổng quy đổi/năm",
        sub_btn_pay: "⚡ Trả ngay",
        sub_due_today: "HÔM NAY ĐẾN HẠN!",
        sub_days_left: "Còn {d} ngày (Ngày {day})",
        sub_cycle_monthly: "Gia hạn mỗi tháng",
        sub_cycle_yearly: "Gia hạn mỗi năm",
        sub_debited_from: "Trích từ",
        confirm_delete_sub: "Bạn có chắc muốn xóa theo dõi dịch vụ này?",
        sub_deleted: "Đã xóa dịch vụ định kỳ!",

        // Budget breakdown & 50/30/20
        budget_limits_title: "💡 MỨC CHI TIÊU HỢP LÝ THEO MỐC",
        btn_config: "⚙️ CẤU HÌNH",
        limit_safe_today: "HÔM NAY ĐƯỢC TIÊU",
        limit_spent_today: "Đã tiêu hôm nay: ",
        limit_rem_week: "TUẦN NÀY CÒN LẠI",
        limit_rem_week_sub: "Hạn mức an toàn 7 ngày",
        limit_rem_month: "THÁNG NÀY CÒN LẠI",
        limit_rem_month_sub: "Đã trừ các dịch vụ cố định",
        limit_fixed_sub: "DỊCH VỤ CỐ ĐỊNH",
        limit_fixed_sub_sub: "Tự động giữ lại mỗi tháng",
        rule_50_30_20_title: "📐 GỢI Ý PHÂN BỔ (QUY TẮC 50/30/20):",
        rule_needs: "🏠 50% Nhu cầu thiết yếu:",
        rule_wants: "🛍️ 30% Mong muốn & Thưởng thức:",
        rule_savings: "💰 20% Tiết kiệm & Tích lũy:",

        // Modals & Forms
        modal_tx_expense_title: "GHI NHẬN KHOẢN CHI",
        modal_tx_income_title: "GHI NHẬN THU NHẬP",
        modal_tx_edit_title: "CHỈNH SỬA GIAO DỊCH",
        label_tx_type: "LOẠI GIAO DỊCH:",
        label_currency: "ĐƠN VỊ TIỀN TỆ:",
        label_amount: "SỐ TIỀN:",
        label_wallet: "NGUỒN TIỀN / VÍ:",
        label_category: "DANH MỤC:",
        label_date: "NGÀY GIAO DỊCH:",
        label_note: "GHI CHÚ / MÔ TẢ:",
        btn_save_tx: "💾 LƯU GIAO DỊCH",
        btn_cancel: "HỦY",
        btn_close: "ĐÓNG",

        // Deposit Modal
        modal_deposit_title: "⚡ NẠP / THÊM TIỀN VÀO NGUỒN TIỀN",
        label_deposit_wallet: "CHỌN NGUỒN TIỀN / VÍ NHẬN:",
        label_deposit_amount: "SỐ TIỀN NẠP:",
        label_deposit_cat: "DANH MỤC THU NHẬP / NGUỒN ĐẾN:",
        label_deposit_date: "NGÀY NẠP:",
        btn_confirm_deposit: "💰 XÁC NHẬN NẠP TIỀN",

        // Transfer Modal
        modal_transfer_title: "🔄 CHUYỂN TIỀN GIỮA CÁC VÍ",
        label_transfer_from: "CHUYỂN TỪ NGUỒN (TRỪ TIỀN):",
        label_transfer_to: "CHUYỂN ĐẾN NGUỒN (CỘNG TIỀN):",
        label_transfer_amount: "SỐ TIỀN CHUYỂN (THEO NGUỒN GỬI):",
        transfer_hint: "Hệ thống tự động quy đổi tỷ giá nếu 2 ví khác đơn vị tiền tệ (EUR, USD, VND).",
        btn_confirm_transfer: "🔄 XÁC NHẬN CHUYỂN TIỀN",

        // Add Wallet Modal
        modal_wallet_title: "💼 THÊM NGUỒN TIỀN / VÍ MỚI",
        label_wallet_name: "TÊN NGUỒN TIỀN:",
        label_wallet_curr: "LOẠI TIỀN TỆ CỦA VÍ:",
        label_wallet_type: "LOẠI NGUỒN:",
        label_init_bal: "SỐ DƯ BAN ĐẦU:",
        label_icon: "BIỂU TƯỢNG (EMOJI):",
        label_color: "MÀU SẮC ĐẠI DIỆN:",
        btn_create_wallet: "💾 TẠO NGUỒN TIỀN",

        // Converter Modal
        modal_converter_title: "💱 BỘ CHUYỂN ĐỔI TIỀN TỆ PIXEL",
        label_convert_amount: "SỐ TIỀN CẦN ĐỔI:",
        label_convert_from: "TỪ ĐƠN VỊ:",
        rates_settings_title: "⚙️ CÀI ĐẶT TỶ GIÁ QUY ĐỔI:",
        btn_sync_online: "⚡ Đồng Bộ Online",
        btn_save_rates: "💾 LƯU TỶ GIÁ TÙY CHỈNH",

        // Subscription Modal
        modal_sub_title: "THÊM DỊCH VỤ ĐỊNH KỲ",
        modal_sub_edit_title: "CHỈNH SỬA DỊCH VỤ ĐỊNH KỲ",
        label_sub_name: "TÊN DỊCH VỤ / KHOẢN CỐ ĐỊNH:",
        label_sub_day: "NGÀY ĐẾN HẠN HÀNG THÁNG (1 - 31):",
        label_sub_billing_day: "NGÀY ĐẾN HẠN HÀNG THÁNG (1 - 31):",
        label_sub_wallet: "TRÍCH TỪ NGUỒN TIỀN:",
        label_sub_cycle: "CHU KỲ GIA HẠN:",
        cycle_monthly: "Hàng tháng",
        cycle_yearly: "Hàng năm",
        btn_add_sub_confirm: "➕ THÊM THEO DÕI",
        btn_save_changes: "LƯU THAY ĐỔI",
        sub_updated: "Đã cập nhật dịch vụ định kỳ thành công!",
        rule_savings_label: "Tiết kiệm & Tích lũy",

        // Currency names & Converter
        curr_name_vnd: "VIỆT NAM ĐỒNG",
        curr_name_eur: "EURO (EUR CENTS)",
        curr_name_usd: "ĐÔ LA MỸ (USD)",
        rate_label_usd: "1 USD = ? VNĐ",
        rate_label_eur: "1 EUR = ? VNĐ",
        opt_curr_vnd_full: "₫ VNĐ (Việt Nam Đồng)",
        opt_curr_eur_full: "€ EUR (Euro - hỗ trợ cents)",
        opt_curr_usd_full: "$ USD (Đô la Mỹ - hỗ trợ cents)",
        opt_curr_eur_short: "€ EUR (hỗ trợ cents)",
        opt_curr_usd_short: "$ USD (hỗ trợ cents)",
        cents_label: "(cents)",

        // Budget Settings Modal
        modal_budget_title: "THIẾT LẬP MỤC TIÊU & HẠN MỨC",
        label_income_type: "LOẠI HÌNH THU NHẬP CỦA BẠN:",
        income_type_variable: "Thu Nhập Tự Do / Bất Định",
        income_type_fixed: "Lương Cố Định Hàng Tháng",
        hint_variable_income_explain: "Đánh giá sức khỏe tài chính thông minh dựa trên <b>Tổng Tài Sản trong các ví</b> và <b>Quỹ Sinh Tồn (Runway)</b>, bảo vệ bạn không bị cạn tiền ngay cả khi tháng này không có thu nhập cố định!",
        label_runway_target: "MỤC TIÊU QUỸ SINH TỒN (SỐ THÁNG DỰ PHÒNG):",
        opt_runway_3: "3 tháng (Khẩn cấp tối thiểu)",
        opt_runway_6: "6 tháng (Khuyên dùng - Chuẩn an toàn)",
        opt_runway_9: "9 tháng (Bền vững)",
        opt_runway_12: "12 tháng (Tuyệt đối an tâm / Tự do ngắn hạn)",
        hint_runway_target: "Số tháng bạn muốn tổng tài sản hiện tại có thể bảo đảm cuộc sống.",
        label_budget_curr: "ĐƠN VỊ TIỀN TỆ THIẾT LẬP:",
        label_expected_income: "THU NHẬP DỰ KIẾN HÀNG THÁNG",
        label_monthly_budget: "HẠN MỨC CHI TIÊU SINH HOẠT TRẦN / THÁNG",
        hint_expected_income: "Nếu có thu nhập thực tế trong tháng, hệ thống tự động cộng dồn vào hạn mức",
        hint_monthly_budget: "Mức chi tiêu tối đa mỗi tháng bạn mong muốn (Burn rate)",
        income_optional: "(Tùy chọn)",
        label_savings_pct: "MỤC TIÊU TIẾT KIỆM (% THU NHẬP):",
        hint_savings_pct: "Ví dụ: 20% hoặc 25% thu nhập",
        btn_save_budget: "💾 LƯU THIẾT LẬP",
        budget_updated: "Đã cập nhật ngân sách thành công!",
        health_title_runway: "❤️ SỨC KHỎE TÀI CHÍNH (QUỸ SINH TỒN & TỔNG TÀI SẢN)",
        breakdown_title_runway: "📐 PHÂN BỔ QUỸ TÀI CHÍNH (QUỸ SINH TỒN):",
        lbl_runway_current: "🛡️ Quỹ sinh tồn hiện có (Runway):",
        lbl_monthly_burn: "⚡ Chi tiêu sinh hoạt trần/tháng:",
        lbl_cashflow_status: "📈 Dòng tiền ròng thực tế tháng này:",

        // Backup Modal
        modal_backup_title: "SAO LƯU & XUẤT BÁO CÁO EXCEL",
        backup_excel_title: "📊 XUẤT FILE EXCEL ĐA TRANG (EUR • USD • VNĐ)",
        backup_excel_desc: "Báo cáo Excel đa tiền tệ với định dạng cents chuyên nghiệp cho EUR và USD:",
        backup_sheet1: "• Sheet 1: Tổng Quan, Tỷ giá quy đổi & Thống kê ví.",
        backup_sheet2: "• Sheet 2: Sổ thu chi chi tiết hiển thị tiền gốc & quy đổi VNĐ.",
        backup_sheet3: "• Sheet 3: Quản lý dịch vụ đăng ký định kỳ.",
        btn_download_excel: "📥 TẢI BÁO CÁO EXCEL ĐẸP MẮT",
        backup_json_title: "💾 SAO LƯU TOÀN BỘ HỆ THỐNG (.JSON)",
        backup_json_desc: "Lưu trữ an toàn các danh mục, giao dịch, số dư ví, dịch vụ và hạn mức tài chính.",
        btn_download_json: "📥 TẢI FILE SAO LƯU .JSON",
        backup_restore_title: "🔄 PHỤC HỒI TỪ FILE JSON",
        backup_restore_desc: "Khôi phục dữ liệu đã sao lưu trước đó từ máy của bạn.",
        btn_import_json: "📤 CHỌN FILE ĐỂ KHÔI PHỤC",

        // Placeholders
        ph_tx_amount: "Ví dụ: 50000",
        ph_tx_note: "Ví dụ: Ăn trưa, Cà phê, Mua sách...",
        ph_deposit_amount: "Ví dụ: 1000000",
        ph_deposit_note: "Ví dụ: Lương, Thưởng, Bán hàng online...",
        ph_transfer_amount: "Ví dụ: 50",
        ph_transfer_note: "Ví dụ: Rút tiền mặt, Nạp thẻ Euro...",
        ph_wallet_name: "Ví dụ: MB Bank, Revolut Euro, PayPal USD...",
        ph_wallet_note: "Mục đích sử dụng nguồn tiền này...",
        ph_sub_name: "Ví dụ: Netflix, Spotify, iCloud, Tiền phòng...",
        ph_sub_amount: "Ví dụ: 10.99 hoặc 260000",
        ph_sub_note: "Gói dịch vụ, người cùng share...",
        ph_savings_pct: "25",

        // Alerts & Notification Toasts
        alert_invalid_amount: "Vui lòng nhập số tiền hợp lệ (> 0)!",
        alert_transfer_same_wallet: "Nguồn gửi và nguồn nhận phải khác nhau!",
        alert_enter_wallet_name: "Vui lòng nhập tên nguồn tiền / ví!",
        alert_enter_sub_details: "Vui lòng nhập tên dịch vụ và số tiền hợp lệ!",
        alert_enter_budget_details: "Vui lòng nhập thu nhập và ngân sách hợp lệ (> 0)!",
        tx_saved: "Đã lưu giao dịch!",
        tx_updated: "Đã cập nhật giao dịch!",
        rates_saved: "Đã lưu tỷ giá tùy chỉnh!",
        sub_saved: "Đã lưu dịch vụ định kỳ!",
        backup_restored: "Khôi phục dữ liệu thành công!",
        tx_initial_count: "0 giao dịch",
        page_title: "Ví Tiền Pixel - Quản Lý Chi Tiêu & Đa Tiền Tệ (EUR • USD • VNĐ)",
        npc_calculating: "Đang tính toán ngân sách an toàn...",
        wallet_type_bank: "🏦 Tài khoản Ngân hàng",
        wallet_type_cash: "💵 Tiền mặt",
        wallet_type_ewallet: "📱 Ví điện tử",
        wallet_type_credit: "💳 Thẻ tín dụng",
        wallet_type_savings: "🐷 Tiết kiệm / Heo đất",
        wallet_created: "Đã tạo nguồn tiền mới!",
        deposit_success: "Nạp tiền vào ví thành công!",
        transfer_success: "Chuyển tiền giữa các ví thành công!",
        rates_synced: "Đã đồng bộ tỷ giá online thành công!",
        sub_paid: "Đã thanh toán dịch vụ định kỳ!",

        // Pixel Calendar Table Picker
        cal_th_mon: "T2",
        cal_th_tue: "T3",
        cal_th_wed: "T4",
        cal_th_thu: "T5",
        cal_th_fri: "T6",
        cal_th_sat: "T7",
        cal_th_sun: "CN",
        cal_selected_day_label: "Ngày {day} hàng tháng",
        cal_preset_start: "Đầu tháng (1)",
        cal_preset_10: "Ngày 10",
        cal_preset_mid: "Giữa tháng (15)",
        cal_preset_20: "Ngày 20",
        cal_preset_25: "Ngày 25",
        cal_preset_end: "Cuối tháng (31)",
        cal_click_hint: "Nhấp vào một ngày trong bảng lịch để chọn ngày thanh toán định kỳ.",
        cal_today_title: "Hôm nay: Ngày {day}",
        label_today_is: "HÔM NAY:",
        label_sub_day_yearly: "NGÀY & THÁNG ĐẾN HẠN HÀNG NĂM:",
        cal_today_banner_label: "Hôm nay là:",
        btn_pick_today: "Chọn Hôm Nay",
        cal_selected_day_yearly_label: "Ngày {day} tháng {month} hàng năm ({day}/{month})",
        sub_days_left_yearly: "Còn {d} ngày ({day}/{month} hàng năm)",
        cal_preset_today: "Hôm nay",
        cal_preset_start_year: "Đầu năm (01/01)",
        cal_preset_mid_year: "Giữa năm (01/07)",
        cal_preset_end_year: "Cuối năm (31/12)",

        other: "Khác",
        footer_text: "VÍ TIỀN PIXEL • PHÁT TRIỂN DÀNH CHO QUẢN LÝ TÀI CHÍNH CÁ NHÂN ĐA TIỀN TỆ (EUR • USD • VNĐ) • 2026"
    },

    en: {
        app_title: "PIXEL MONEY",
        app_subtitle: "MULTI-CURRENCY PERSONAL FINANCE SYSTEM (EUR • USD • VND)",
        currency_display_label: "CURRENCY:",
        lang_label: "LANGUAGE:",

        // Header buttons
        btn_deposit: "⚡ DEPOSIT",
        btn_transfer: "🔄 TRANSFER",
        btn_rates: "💱 RATES",
        btn_expense: "➕ EXPENSE",
        btn_income: "➕ INCOME",
        btn_budget: "🎯 BUDGET",
        btn_excel: "💾 EXCEL / BACKUP",
        btn_sound_on: "🔊 SOUND ON",
        btn_sound_off: "🔇 SOUND OFF",

        // Financial Health & NPC
        health_title: "❤️ FINANCIAL HEALTH STATUS (MONTHLY BUDGET)",
        npc_name: "FINANCIAL KNIGHT",
        npc_advice_label: "TODAY'S ADVICE:",
        btn_edit_budget: "⚙️ EDIT BUDGET",
        status_safe: "SPENDING IS VERY SAFE!",
        status_warning: "MONITOR YOUR SPENDING",
        status_danger: "BUDGET ALERT!",
        npc_advice_safe: "Today you have a safe spending limit of {amount}. Great spending pace, keep it up!",
        npc_advice_warning: "Today you should spend around {amount} to avoid exhausting your budget before month-end.",
        npc_advice_danger: "Warning: Only {rem} left for the remaining {days} days ({amount}/day). Cut non-essential expenses!",

        // Wallets
        wallets_title: "💼 YOUR MONEY SOURCES & WALLETS (MULTI-CURRENCY)",
        wallets_hint: "(Click any wallet card to filter transactions)",
        btn_add_wallet: "➕ Add New Wallet",
        btn_quick_deposit: "➕ Deposit",
        btn_delete_wallet: "Delete this wallet",
        confirm_delete_wallet: "Are you sure you want to delete \"{name}\"?\n(Associated transactions will be preserved)",
        wallet_deleted: "Wallet deleted successfully!",
        wallets_empty_msg: "No money sources / wallets yet! Create a wallet to manage balances and track cash flow.",
        btn_reset_default_wallets: "🔄 Restore Default Wallets",
        no_wallet_selected: "No wallet / Cash",
        total_assets: "Total Net Assets",
        total_assets_sub: "Total available liquid balance",

        // Wallet types full & badges
        wallet_type_bank: "🏦 Bank Account",
        wallet_type_cash: "💵 Cash",
        wallet_type_ewallet: "📱 E-Wallet",
        wallet_type_credit: "💳 Credit Card",
        wallet_type_savings: "🐷 Savings / Piggy Bank",
        wallet_badge_bank: "Bank",
        wallet_badge_cash: "Cash",
        wallet_badge_ewallet: "E-Wallet",
        wallet_badge_credit: "Credit",
        wallet_badge_savings: "Savings",

        // KPI Cards
        kpi_safe_daily: "Daily Allowance",
        kpi_safe_daily_sub: "Safe daily spending limit",
        kpi_expense: "Total Expenses",
        kpi_income: "Total Income",
        kpi_income_sub: "Received revenue streams",
        kpi_balance: "Net Cash Flow",
        kpi_balance_sub: "Income minus expenses this period",

        // Period tabs
        period_title: "📊 STATISTICAL TIMEFRAME",
        period_day: "Today",
        period_week: "This Week",
        period_month: "This Month",
        period_year: "This Year",
        period_all: "All Time",

        // Charts & Top Expenses
        chart_title: "📈 SPENDING ANALYTICS & CHARTS",
        btn_export_excel_sm: "📥 Export Excel Report",
        chart_cat: "🍩 BY CATEGORY",
        chart_timeline: "📊 CASH FLOW TREND",
        chart_empty: "👾 No expenses recorded for this period!",
        top_expenses_title: "🏆 TOP 5 BIGGEST EXPENSES",

        // Transactions list & filters
        tx_title: "📜 TRANSACTION HISTORY & SOURCES",
        search_placeholder: "🔍 Search notes...",
        filter_all_cats: "All Categories",
        filter_all_wallets: "All Sources / Wallets",
        filter_all_currencies: "All Currencies",
        filter_all_types: "All Types",
        type_expense: "Expense",
        type_income: "Income",
        no_transactions: "🕹️ No matching transactions found!",
        confirm_delete_tx: "Are you sure you want to delete this transaction?",
        tx_deleted: "Transaction deleted successfully!",

        // Subscriptions
        sub_title: "📺 RECURRING SERVICES & SUBSCRIPTIONS",
        btn_add_sub: "➕ ADD",
        sub_monthly_total: "Fixed Monthly Total",
        sub_yearly_total: "Annual Equivalent",
        sub_btn_pay: "⚡ Pay Now",
        sub_due_today: "DUE TODAY!",
        sub_days_left: "{d} days left (Day {day})",
        sub_cycle_monthly: "Monthly billing",
        sub_cycle_yearly: "Yearly billing",
        sub_debited_from: "Paid from",
        confirm_delete_sub: "Are you sure you want to delete this subscription?",
        sub_deleted: "Subscription deleted successfully!",

        // Budget breakdown & 50/30/20
        budget_limits_title: "💡 SMART SPENDING LIMITS BY MILESTONE",
        btn_config: "⚙️ CONFIG",
        limit_safe_today: "SAFE TO SPEND TODAY",
        limit_spent_today: "Spent today: ",
        limit_rem_week: "WEEKLY REMAINING",
        limit_rem_week_sub: "Safe 7-day budget limit",
        limit_rem_month: "MONTHLY REMAINING",
        limit_rem_month_sub: "Fixed bills deducted",
        limit_fixed_sub: "FIXED BILLS",
        limit_fixed_sub_sub: "Reserved each month",
        rule_50_30_20_title: "📐 50/30/20 BUDGETING RULE ALLOCATION:",
        rule_needs: "🏠 50% Essential Needs:",
        rule_wants: "🛍️ 30% Flexible Wants:",
        rule_savings: "💰 20% Savings & Investments:",

        // Modals & Forms
        modal_tx_expense_title: "RECORD EXPENSE",
        modal_tx_income_title: "RECORD INCOME",
        modal_tx_edit_title: "EDIT TRANSACTION",
        label_tx_type: "TRANSACTION TYPE:",
        label_currency: "CURRENCY:",
        label_amount: "AMOUNT:",
        label_wallet: "SOURCE / WALLET:",
        label_category: "CATEGORY:",
        label_date: "DATE:",
        label_note: "NOTE / DESCRIPTION:",
        btn_save_tx: "💾 SAVE TRANSACTION",
        btn_cancel: "CANCEL",
        btn_close: "CLOSE",

        // Deposit Modal
        modal_deposit_title: "⚡ DEPOSIT / ADD FUNDS TO WALLET",
        label_deposit_wallet: "DESTINATION WALLET:",
        label_deposit_amount: "DEPOSIT AMOUNT:",
        label_deposit_cat: "INCOME CATEGORY:",
        label_deposit_date: "DEPOSIT DATE:",
        btn_confirm_deposit: "💰 CONFIRM DEPOSIT",

        // Transfer Modal
        modal_transfer_title: "🔄 INTERNAL WALLET TRANSFER",
        label_transfer_from: "FROM SOURCE (DEBIT):",
        label_transfer_to: "TO SOURCE (CREDIT):",
        label_transfer_amount: "TRANSFER AMOUNT:",
        transfer_hint: "Currencies will be converted automatically using current exchange rates.",
        btn_confirm_transfer: "🔄 CONFIRM TRANSFER",

        // Add Wallet Modal
        modal_wallet_title: "💼 ADD NEW MONEY SOURCE / WALLET",
        label_wallet_name: "WALLET NAME:",
        label_wallet_curr: "WALLET CURRENCY:",
        label_wallet_type: "SOURCE TYPE:",
        label_init_bal: "INITIAL BALANCE:",
        label_icon: "ICON (EMOJI):",
        label_color: "ACCENT COLOR:",
        btn_create_wallet: "💾 CREATE WALLET",

        // Converter Modal
        modal_converter_title: "💱 PIXEL CURRENCY CONVERTER",
        label_convert_amount: "AMOUNT TO CONVERT:",
        label_convert_from: "FROM CURRENCY:",
        rates_settings_title: "⚙️ EXCHANGE RATES SETTINGS:",
        btn_sync_online: "⚡ Sync Online",
        btn_save_rates: "💾 SAVE CUSTOM RATES",

        // Subscription Modal
        modal_sub_title: "ADD RECURRING SUBSCRIPTION",
        modal_sub_edit_title: "EDIT RECURRING SUBSCRIPTION",
        label_sub_name: "SERVICE NAME:",
        label_sub_day: "MONTHLY DUE DAY (1 - 31):",
        label_sub_billing_day: "MONTHLY DUE DAY (1 - 31):",
        label_sub_wallet: "DEBIT FROM WALLET:",
        label_sub_cycle: "BILLING CYCLE:",
        cycle_monthly: "Monthly",
        cycle_yearly: "Yearly",
        btn_add_sub_confirm: "➕ ADD TRACKING",
        btn_save_changes: "SAVE CHANGES",
        sub_updated: "Recurring subscription updated successfully!",
        rule_savings_label: "Savings & Investments",

        // Currency names & Converter
        curr_name_vnd: "VIETNAMESE DONG",
        curr_name_eur: "EURO (EUR CENTS)",
        curr_name_usd: "US DOLLAR (USD)",
        rate_label_usd: "1 USD = ? VND",
        rate_label_eur: "1 EUR = ? VND",
        opt_curr_vnd_full: "₫ VND (Vietnamese Dong)",
        opt_curr_eur_full: "€ EUR (Euro - with cents)",
        opt_curr_usd_full: "$ USD (US Dollar - with cents)",
        opt_curr_eur_short: "€ EUR (with cents)",
        opt_curr_usd_short: "$ USD (with cents)",
        cents_label: "(cents)",

        // Budget Settings Modal
        modal_budget_title: "SET FINANCIAL GOALS & CEILING",
        label_income_type: "YOUR INCOME TYPE:",
        income_type_variable: "Freelance / Variable Income",
        income_type_fixed: "Fixed Monthly Salary",
        hint_variable_income_explain: "Smart financial health evaluation based on <b>Total Liquid Assets in wallets</b> and <b>Survival Runway</b>, protecting you from running out of cash even without a regular paycheck!",
        label_runway_target: "RUNWAY BUFFER GOAL (EMERGENCY MONTHS):",
        opt_runway_3: "3 months (Basic emergency)",
        opt_runway_6: "6 months (Recommended - Standard safe)",
        opt_runway_9: "9 months (Solid buffer)",
        opt_runway_12: "12 months (Total peace of mind / Short-term freedom)",
        hint_runway_target: "Number of months your total liquid wealth must cover living expenses.",
        label_budget_curr: "BUDGET SETTING CURRENCY:",
        label_expected_income: "EXPECTED MONTHLY INCOME",
        label_monthly_budget: "MONTHLY LIVING CEILING BUDGET",
        hint_expected_income: "If real income is received this month, it automatically augments your ceiling",
        hint_monthly_budget: "Planned monthly living burn rate",
        income_optional: "(Optional)",
        label_savings_pct: "TARGET SAVINGS RATE (% INCOME):",
        hint_savings_pct: "E.g., 20% or 25% of income",
        btn_save_budget: "💾 SAVE SETTINGS",
        budget_updated: "Budget updated successfully!",
        health_title_runway: "❤️ FINANCIAL HEALTH (RUNWAY & LIQUID ASSETS)",
        breakdown_title_runway: "📐 FINANCIAL ASSET ALLOCATION (RUNWAY BUFFER):",
        lbl_runway_current: "🛡️ Current Survival Runway:",
        lbl_monthly_burn: "⚡ Monthly Living Ceiling:",
        lbl_cashflow_status: "📈 Actual Net Cashflow This Month:",

        // Backup Modal
        modal_backup_title: "BACKUP & EXCEL REPORT EXPORT",
        backup_excel_title: "📊 MULTI-SHEET EXCEL EXPORT (EUR • USD • VND)",
        backup_excel_desc: "Multi-currency Excel report with professional cents formatting for EUR and USD:",
        backup_sheet1: "• Sheet 1: Overview, Exchange Rates & Wallet Balances.",
        backup_sheet2: "• Sheet 2: Detailed Transaction Ledger with native currency & VND conversion.",
        backup_sheet3: "• Sheet 3: Recurring Subscriptions & Billing Tracker.",
        btn_download_excel: "📥 DOWNLOAD EXCEL REPORT",
        backup_json_title: "💾 FULL SYSTEM BACKUP (.JSON)",
        backup_json_desc: "Safely backup categories, transactions, wallet balances, subscriptions and budget targets.",
        btn_download_json: "📥 DOWNLOAD JSON BACKUP",
        backup_restore_title: "🔄 RESTORE FROM JSON FILE",
        backup_restore_desc: "Restore previously exported backup data from your device.",
        btn_import_json: "📤 CHOOSE FILE TO RESTORE",

        // Placeholders
        ph_tx_amount: "E.g., 50.00",
        ph_tx_note: "E.g., Lunch, Coffee, Books...",
        ph_deposit_amount: "E.g., 1000.00",
        ph_deposit_note: "E.g., Salary, Bonus, Freelance...",
        ph_transfer_amount: "E.g., 50.00",
        ph_transfer_note: "E.g., Cash withdrawal, Euro top-up...",
        ph_wallet_name: "E.g., Main Bank, Revolut EUR, PayPal USD...",
        ph_wallet_note: "Purpose of this money source...",
        ph_sub_name: "E.g., Netflix, Spotify, iCloud, Rent...",
        ph_sub_amount: "E.g., 10.99 or 250.00",
        ph_sub_note: "Plan details, shared with...",
        ph_savings_pct: "25",

        // Alerts & Notification Toasts
        alert_invalid_amount: "Please enter a valid amount (> 0)!",
        alert_transfer_same_wallet: "Source and destination wallets must be different!",
        alert_enter_wallet_name: "Please enter wallet name!",
        alert_enter_sub_details: "Please enter service name and amount!",
        alert_enter_budget_details: "Please enter valid income and budget amounts (> 0)!",
        tx_saved: "Transaction saved!",
        tx_updated: "Transaction updated!",
        rates_saved: "Custom exchange rates saved!",
        sub_saved: "Subscription saved!",
        backup_restored: "Data restored successfully!",
        tx_initial_count: "0 transactions",
        page_title: "Pixel Money - Multi-Currency Expense Manager (EUR • USD • VND)",
        npc_calculating: "Calculating safe budget...",
        wallet_type_bank: "🏦 Bank Account",
        wallet_type_cash: "💵 Cash",
        wallet_type_ewallet: "📱 E-Wallet",
        wallet_type_credit: "💳 Credit Card",
        wallet_type_savings: "🐷 Savings / Piggy Bank",
        wallet_created: "Wallet created successfully!",
        deposit_success: "Deposited to wallet successfully!",
        transfer_success: "Transferred between wallets successfully!",
        rates_synced: "Exchange rates synced online successfully!",
        sub_paid: "Subscription paid successfully!",

        // Pixel Calendar Table Picker
        cal_th_mon: "Mo",
        cal_th_tue: "Tu",
        cal_th_wed: "We",
        cal_th_thu: "Th",
        cal_th_fri: "Fr",
        cal_th_sat: "Sa",
        cal_th_sun: "Su",
        cal_selected_day_label: "Day {day} every month",
        cal_preset_start: "Start of month (1)",
        cal_preset_10: "Day 10",
        cal_preset_mid: "Mid month (15)",
        cal_preset_20: "Day 20",
        cal_preset_25: "Day 25",
        cal_preset_end: "End of month (31)",
        cal_click_hint: "Click any date in the calendar table to select the recurring billing day.",
        cal_today_title: "Today: Day {day}",
        label_today_is: "TODAY:",
        label_sub_day_yearly: "ANNUAL BILLING DATE (DAY & MONTH):",
        cal_today_banner_label: "Today is:",
        btn_pick_today: "Pick Today",
        cal_selected_day_yearly_label: "Day {day}, Month {month} yearly ({day}/{month})",
        sub_days_left_yearly: "In {d} days ({day}/{month} yearly)",
        cal_preset_today: "Today",
        cal_preset_start_year: "Start of year (01/01)",
        cal_preset_mid_year: "Mid year (01/07)",
        cal_preset_end_year: "End of year (31/12)",

        other: "Other",
        footer_text: "PIXEL MONEY • MULTI-CURRENCY PERSONAL FINANCE MANAGER (EUR • USD • VND) • 2026"
    },

    de: {
        app_title: "PIXEL GELD",
        app_subtitle: "MEHRWÄHRUNGS-FINANZVERWALTUNG (EUR • USD • VND)",
        currency_display_label: "WÄHRUNG:",
        lang_label: "SPRACHE:",

        // Header buttons
        btn_deposit: "⚡ EINZAHLEN",
        btn_transfer: "🔄 ÜBERWEISEN",
        btn_rates: "💱 WECHSELKURS",
        btn_expense: "➕ AUSGABE",
        btn_income: "➕ EINNAHME",
        btn_budget: "🎯 BUDGET",
        btn_excel: "💾 EXCEL / BACKUP",
        btn_sound_on: "🔊 TON AN",
        btn_sound_off: "🔇 TON AUS",

        // Financial Health & NPC
        health_title: "❤️ FINANZIELLE GESUNDHEIT (MONATSBUDGET)",
        npc_name: "FINANZ-RITTER",
        npc_advice_label: "HEUTIGER RAT:",
        btn_edit_budget: "⚙️ BUDGET ÄNDERN",
        status_safe: "AUSGABEN SIND SEHR SICHER!",
        status_warning: "AUSGABEN KONTROLLIEREN",
        status_danger: "BUDGET-ALARM!",
        npc_advice_safe: "Heute beträgt Ihr sicheres Ausgabenlimit {amount}. Sehr gutes Tempo, weiter so!",
        npc_advice_warning: "Heute sollten Sie maximal {amount} ausgeben, um das Monatsbudget nicht vorzeitig zu leeren.",
        npc_advice_danger: "Warnung: Nur noch {rem} für die verbleibenden {days} Tage ({amount}/Tag). Bitte unnötige Ausgaben stoppen!",

        // Wallets
        wallets_title: "💼 GELDQUELLEN & WALLETS (MEHRWÄHRUNG)",
        wallets_hint: "(Auf eine Wallet klicken, um Transaktionen zu filtern)",
        btn_add_wallet: "➕ Neue Wallet",
        btn_quick_deposit: "➕ Einzahlen",
        btn_delete_wallet: "Dieses Wallet löschen",
        confirm_delete_wallet: "Sind Sie sicher, dass Sie \"{name}\" löschen möchten?\n(Bestehende Transaktionen bleiben erhalten)",
        wallet_deleted: "Wallet erfolgreich gelöscht!",
        wallets_empty_msg: "Noch keine Geldquellen / Wallets! Erstellen Sie ein Wallet zur Kontoverwaltung.",
        btn_reset_default_wallets: "🔄 Standard-Wallets wiederherstellen",
        no_wallet_selected: "Keine Wallet / Bargeld",
        total_assets: "Gesamtvermögen",
        total_assets_sub: "Verfügbares Gesamtguthaben",

        // Wallet types full & badges
        wallet_type_bank: "🏦 Bankkonto",
        wallet_type_cash: "💵 Bargeld",
        wallet_type_ewallet: "📱 E-Wallet",
        wallet_type_credit: "💳 Kreditkarte",
        wallet_type_savings: "🐷 Sparen / Sparschwein",
        wallet_badge_bank: "Bank",
        wallet_badge_cash: "Bargeld",
        wallet_badge_ewallet: "E-Wallet",
        wallet_badge_credit: "Kredit",
        wallet_badge_savings: "Sparen",

        // KPI Cards
        kpi_safe_daily: "Tageslimit Heute",
        kpi_safe_daily_sub: "Sicheres tägliches Ausgabenlimit",
        kpi_expense: "Gesamtausgaben",
        kpi_income: "Gesamteinnahmen",
        kpi_income_sub: "Erhaltene Einnahmequellen",
        kpi_balance: "Netto-Cashflow",
        kpi_balance_sub: "Einnahmen abzüglich Ausgaben",

        // Period tabs
        period_title: "📊 STATISTISCHER ZEITRAUM",
        period_day: "Heute",
        period_week: "Diese Woche",
        period_month: "Dieser Monat",
        period_year: "Dieses Jahr",
        period_all: "Gesamt",

        // Charts & Top Expenses
        chart_title: "📈 AUSGABENANALYSE & DIAGRAMME",
        btn_export_excel_sm: "📥 Excel-Bericht Herunterladen",
        chart_cat: "🍩 NACH KATEGORIE",
        chart_timeline: "📊 CASHFLOW-VERLAUF",
        chart_empty: "👾 Keine Ausgaben in diesem Zeitraum verzeichnet!",
        top_expenses_title: "🏆 TOP 5 GRÖSSTE AUSGABEN",

        // Transactions list & filters
        tx_title: "📜 TRANSAKTIONSVERLAUF & QUELLEN",
        search_placeholder: "🔍 Notiz suchen...",
        filter_all_cats: "Alle Kategorien",
        filter_all_wallets: "Alle Quellen / Wallets",
        filter_all_currencies: "Alle Währungen",
        filter_all_types: "Alle Typen",
        type_expense: "Ausgabe",
        type_income: "Einnahme",
        no_transactions: "🕹️ Keine passenden Transaktionen gefunden!",
        confirm_delete_tx: "Möchten Sie diese Transaktion wirklich löschen?",
        tx_deleted: "Transaktion erfolgreich gelöscht!",

        // Subscriptions
        sub_title: "📺 WIEDERKEHRENDE DIENSTE & ABOS",
        btn_add_sub: "➕ NEU",
        sub_monthly_total: "Feste monatliche Kosten",
        sub_yearly_total: "Jahresäquivalent",
        sub_btn_pay: "⚡ Jetzt zahlen",
        sub_due_today: "HEUTE FÄLLIG!",
        sub_days_left: "Noch {d} Tage (Tag {day})",
        sub_cycle_monthly: "Monatliche Verlängerung",
        sub_cycle_yearly: "Jährliche Verlängerung",
        sub_debited_from: "Abgebucht von",
        confirm_delete_sub: "Möchten Sie dieses Abo wirklich löschen?",
        sub_deleted: "Abo erfolgreich gelöscht!",

        // Budget breakdown & 50/30/20
        budget_limits_title: "💡 ANGEMESSENE AUSGABENLIMITS",
        btn_config: "⚙️ EINSTELLEN",
        limit_safe_today: "HEUTE VERFÜGBAR",
        limit_spent_today: "Heute ausgegeben: ",
        limit_rem_week: "WÖCHENTLICH ÜBRIG",
        limit_rem_week_sub: "Sicheres 7-Tage-Limit",
        limit_rem_month: "MONATLICH ÜBRIG",
        limit_rem_month_sub: "Feste Abos bereits abgezogen",
        limit_fixed_sub: "FESTE ABOS",
        limit_fixed_sub_sub: "Monatlich reserviert",
        rule_50_30_20_title: "📐 50/30/20 BUDGETREGEL-AUFTEILUNG:",
        rule_needs: "🏠 50% Grundbedürfnisse:",
        rule_wants: "🛍️ 30% Wünsche & Freizeit:",
        rule_savings: "💰 20% Sparen & Rücklagen:",

        // Modals & Forms
        modal_tx_expense_title: "AUSGABE ERFASSEN",
        modal_tx_income_title: "EINNAHME ERFASSEN",
        modal_tx_edit_title: "TRANSAKTION BEARBEITEN",
        label_tx_type: "TRANSAKTIONSTYP:",
        label_currency: "WÄHRUNG:",
        label_amount: "BETRAG:",
        label_wallet: "QUELLE / WALLET:",
        label_category: "KATEGORIE:",
        label_date: "DATUM:",
        label_note: "NOTIZ / BESCHREIBUNG:",
        btn_save_tx: "💾 TRANSAKTION SPEICHERN",
        btn_cancel: "ABBRECHEN",
        btn_close: "SCHLIESSEN",

        // Deposit Modal
        modal_deposit_title: "⚡ GELD EINZAHLEN AUF WALLET",
        label_deposit_wallet: "ZIEL-WALLET WÄHLEN:",
        label_deposit_amount: "EINZAHLUNGSBETRAG:",
        label_deposit_cat: "EINNAHMEKATEGORIE:",
        label_deposit_date: "EINZAHLUNGSDATUM:",
        btn_confirm_deposit: "💰 EINZAHLUNG BESTÄTIGEN",

        // Transfer Modal
        modal_transfer_title: "🔄 INTERNE ÜBERWEISUNG",
        label_transfer_from: "VON QUELLE (ABBUCHEN):",
        label_transfer_to: "ZU QUELLE (GUTSCHRIFT):",
        label_transfer_amount: "ÜBERWEISUNGSBETRAG:",
        transfer_hint: "Beträge werden automatisch zum aktuellen Wechselkurs umgerechnet.",
        btn_confirm_transfer: "🔄 ÜBERWEISUNG BESTÄTIGEN",

        // Add Wallet Modal
        modal_wallet_title: "💼 NEUE GELDQUELLE / WALLET ERSTELLEN",
        label_wallet_name: "WALLET-NAME:",
        label_wallet_curr: "WALLET-WÄHRUNG:",
        label_wallet_type: "QUELLENTYP:",
        label_init_bal: "STARTGUTHABEN:",
        label_icon: "SYMBOL (EMOJI):",
        label_color: "FARBE:",
        btn_create_wallet: "💾 WALLET ERSTELLEN",

        // Converter Modal
        modal_converter_title: "💱 PIXEL WÄHRUNGSRECHNER",
        label_convert_amount: "ZU WECHSELNDER BETRAG:",
        label_convert_from: "AUSGANGSWÄHRUNG:",
        rates_settings_title: "⚙️ WECHSELKURS-EINSTELLUNGEN:",
        btn_sync_online: "⚡ Online synchronisieren",
        btn_save_rates: "💾 WECHSELKURSE SPEICHERN",

        // Subscription Modal
        modal_sub_title: "WIEDERKEHRENDES ABO HINZUFÜGEN",
        modal_sub_edit_title: "ABONNEMENT BEARBEITEN",
        label_sub_name: "DIENSTNAME / BEZEICHNUNG:",
        label_sub_day: "FÄLLIGKEITSTAG IM MONAT (1 - 31):",
        label_sub_billing_day: "MONATLICHER FÄLLIGKEITSTAG (1 - 31):",
        label_sub_wallet: "ABBUCHUNG VOM KONTO:",
        label_sub_cycle: "ABRECHNUNGSZYKLUS:",
        cycle_monthly: "Monatlich",
        cycle_yearly: "Jährlich",
        btn_add_sub_confirm: "➕ ZU ABOS HINZUFÜGEN",
        btn_save_changes: "ÄNDERUNGEN SPEICHERN",
        sub_updated: "Abonnement erfolgreich aktualisiert!",
        rule_savings_label: "Sparen & Rücklagen",

        // Currency names & Converter
        curr_name_vnd: "VIETNAMESISCHER DONG",
        curr_name_eur: "EURO (EUR CENTS)",
        curr_name_usd: "US-DOLLAR (USD)",
        rate_label_usd: "1 USD = ? VND",
        rate_label_eur: "1 EUR = ? VND",
        opt_curr_vnd_full: "₫ VND (Vietnamesischer Dong)",
        opt_curr_eur_full: "€ EUR (Euro - mit Cents)",
        opt_curr_usd_full: "$ USD (US-Dollar - mit Cents)",
        opt_curr_eur_short: "€ EUR (mit Cents)",
        opt_curr_usd_short: "$ USD (mit Cents)",
        cents_label: "(Cents)",

        // Budget Settings Modal
        modal_budget_title: "ZIELE & MONATSBUDGET EINSTELLEN",
        label_income_type: "IHRE EINKOMMENSART:",
        income_type_variable: "Freelance / Variables Einkommen",
        income_type_fixed: "Festes Monatsgehalt",
        hint_variable_income_explain: "Intelligente Finanzgesundheitsbewertung basierend auf <b>Gesamtguthaben</b> und <b>Überlebenspuffer (Runway)</b>, damit Ihnen das Geld nie ausgeht!",
        label_runway_target: "RUNWAY-NOTFALLPUFFER (MONATE):",
        opt_runway_3: "3 Monate (Basis-Notfall)",
        opt_runway_6: "6 Monate (Empfohlen - Standard)",
        opt_runway_9: "9 Monate (Solider Puffer)",
        opt_runway_12: "12 Monate (Absolute Ruhe)",
        hint_runway_target: "Anzahl der Monate, die Ihr Gesamtguthaben die Lebenshaltungskosten decken soll.",
        label_budget_curr: "EINSTELLUNGSWÄHRUNG:",
        label_expected_income: "GESCHÄTZTES MONATSEINKOMMEN",
        label_monthly_budget: "MONATLICHES AUSGABENLIMIT",
        hint_expected_income: "Reales Einkommen in diesem Monat erhöht automatisch Ihr Ausgabenlimit",
        hint_monthly_budget: "Geplante monatliche Lebenshaltungskosten (Burn-Rate)",
        income_optional: "(Optional)",
        label_savings_pct: "SPARZIEL (% DES EINKOMMENS):",
        hint_savings_pct: "Z.B. 20% oder 25% des Einkommens",
        btn_save_budget: "💾 EINSTELLUNGEN SPEICHERN",
        budget_updated: "Budget erfolgreich aktualisiert!",
        health_title_runway: "❤️ FINANZGESUNDHEIT (RUNWAY & GESAMTVERMÖGEN)",
        breakdown_title_runway: "📐 VERMÖGENSALLOKATION (RUNWAY-PUFFER):",
        lbl_runway_current: "🛡️ Aktueller Überlebenspuffer:",
        lbl_monthly_burn: "⚡ Monatliches Ausgabenlimit:",
        lbl_cashflow_status: "📈 Tatsächlicher Netto-Cashflow diesen Monat:",

        // Backup Modal
        modal_backup_title: "BACKUP & EXCEL-BERICHT EXPORTIEREN",
        backup_excel_title: "📊 MEHRSEITIGER EXCEL-EXPORT (EUR • USD • VND)",
        backup_excel_desc: "Mehrwährungs-Excel-Bericht mit professioneller Cent-Formatierung für EUR und USD:",
        backup_sheet1: "• Sheet 1: Übersicht, Wechselkurse & Wallet-Salden.",
        backup_sheet2: "• Sheet 2: Detailliertes Kassenbuch mit Originalwährung & VND-Umrechnung.",
        backup_sheet3: "• Sheet 3: Wiederkehrende Abonnements & Rechnungsverfolgung.",
        btn_download_excel: "📥 EXCEL-BERICHT HERUNTERLADEN",
        backup_json_title: "💾 VOLLSTÄNDIGES SYSTEM-BACKUP (.JSON)",
        backup_json_desc: "Sichere Sicherung von Kategorien, Transaktionen, Wallets, Abos und Budgetzielen.",
        btn_download_json: "📥 JSON-BACKUP HERUNTERLADEN",
        backup_restore_title: "🔄 AUS JSON-DATEI WIEDERHERSTELLEN",
        backup_restore_desc: "Zuvor exportierte Sicherungsdaten von Ihrem Gerät wiederherstellen.",
        btn_import_json: "📤 DATEI ZUM WIEDERHERSTELLEN WÄHLEN",

        // Placeholders
        ph_tx_amount: "Z.B. 50,00",
        ph_tx_note: "Z.B. Mittagessen, Kaffee, Bücher...",
        ph_deposit_amount: "Z.B. 1000,00",
        ph_deposit_note: "Z.B. Gehalt, Bonus, Verkauf...",
        ph_transfer_amount: "Z.B. 50,00",
        ph_transfer_note: "Z.B. Bargeldabhebung, Euro-Aufladung...",
        ph_wallet_name: "Z.B. Bankkonto, Revolut EUR, PayPal USD...",
        ph_wallet_note: "Verwendungszweck dieser Geldquelle...",
        ph_sub_name: "Z.B. Netflix, Spotify, iCloud, Miete...",
        ph_sub_amount: "Z.B. 10,99 oder 250,00",
        ph_sub_note: "Tarifdetails, geteilt mit...",
        ph_savings_pct: "25",

        // Alerts & Notification Toasts
        alert_invalid_amount: "Bitte geben Sie einen gültigen Betrag (> 0) ein!",
        alert_transfer_same_wallet: "Quell- und Zielkonto müssen unterschiedlich sein!",
        alert_enter_wallet_name: "Bitte geben Sie einen Wallet-Namen ein!",
        alert_enter_sub_details: "Bitte geben Sie Dienstnamen und Betrag ein!",
        alert_enter_budget_details: "Bitte geben Sie gültiges Einkommen und Budget (> 0) ein!",
        tx_saved: "Transaktion gespeichert!",
        tx_updated: "Transaktion aktualisiert!",
        rates_saved: "Wechselkurse gespeichert!",
        sub_saved: "Abonnement gespeichert!",
        backup_restored: "Daten erfolgreich wiederhergestellt!",
        tx_initial_count: "0 Transaktionen",
        page_title: "Pixel Geld - Multiwährung Ausgaben-Manager (EUR • USD • VND)",
        npc_calculating: "Sicheres Budget wird berechnet...",
        wallet_type_bank: "🏦 Bankkonto",
        wallet_type_cash: "💵 Bargeld",
        wallet_type_ewallet: "📱 E-Wallet",
        wallet_type_credit: "💳 Kreditkarte",
        wallet_type_savings: "🐷 Sparen / Sparschwein",
        wallet_created: "Geldbörse erfolgreich erstellt!",
        deposit_success: "Erfolgreich in Geldbörse eingezahlt!",
        transfer_success: "Erfolgreich zwischen Geldbörsen überwiesen!",
        rates_synced: "Wechselkurse online erfolgreich synchronisiert!",
        sub_paid: "Abonnement erfolgreich bezahlt!",

        // Pixel Calendar Table Picker
        cal_th_mon: "Mo",
        cal_th_tue: "Di",
        cal_th_wed: "Mi",
        cal_th_thu: "Do",
        cal_th_fri: "Fr",
        cal_th_sat: "Sa",
        cal_th_sun: "So",
        cal_selected_day_label: "Tag {day} jeden Monat",
        cal_preset_start: "Monatsanfang (1)",
        cal_preset_10: "Tag 10",
        cal_preset_mid: "Monatsmitte (15)",
        cal_preset_20: "Tag 20",
        cal_preset_25: "Tag 25",
        cal_preset_end: "Monatsende (31)",
        cal_click_hint: "Klicken Sie auf ein Datum in der Kalendertabelle, um den Abrechnungstag auszuwählen.",
        cal_today_title: "Heute: Tag {day}",
        label_today_is: "HEUTE:",
        label_sub_day_yearly: "JÄHRLICHER ABRECHNUNGSTAG (TAG & MONAT):",
        cal_today_banner_label: "Heute ist:",
        btn_pick_today: "Heute wählen",
        cal_selected_day_yearly_label: "Tag {day}, Monat {month} jährlich ({day}.{month}.)",
        sub_days_left_yearly: "In {d} Tagen ({day}.{month}. jährlich)",
        cal_preset_today: "Heute",
        cal_preset_start_year: "Jahresanfang (01.01)",
        cal_preset_mid_year: "Jahresmitte (01.07)",
        cal_preset_end_year: "Jahresende (31.12)",

        other: "Sonstiges",
        footer_text: "PIXEL GELD • MEHRWÄHRUNGS-FINANZVERWALTUNG (EUR • USD • VND) • 2026"
    }
};

// Category translations dictionary (database Vietnamese names -> EN & DE)
const categoryTranslations = {
    'Ăn uống': { vi: 'Ăn uống', en: 'Food & Dining', de: 'Essen & Trinken' },
    'Nhà cửa & Hóa đơn': { vi: 'Nhà cửa & Hóa đơn', en: 'Housing & Bills', de: 'Wohnen & Rechnungen' },
    'Xăng xe & Đi lại': { vi: 'Xăng xe & Đi lại', en: 'Transport & Fuel', de: 'Transport & Benzin' },
    'Dịch vụ số & Đăng ký': { vi: 'Dịch vụ số & Đăng ký', en: 'Digital Subscriptions', de: 'Digitale Abos' },
    'Mua sắm & Đồ dùng': { vi: 'Mua sắm & Đồ dùng', en: 'Shopping & Goods', de: 'Einkaufen & Bedarf' },
    'Giao lưu & Bạn bè': { vi: 'Giao lưu & Bạn bè', en: 'Social & Friends', de: 'Freunde & Freizeit' },
    'Sức khỏe & Y tế': { vi: 'Sức khỏe & Y tế', en: 'Health & Medical', de: 'Gesundheit & Medizin' },
    'Học tập & Sách': { vi: 'Học tập & Sách', en: 'Education & Books', de: 'Bildung & Bücher' },
    'Game & Giải trí': { vi: 'Game & Giải trí', en: 'Gaming & Fun', de: 'Gaming & Unterhaltung' },
    'Nạp tiền vào ví': { vi: 'Nạp tiền vào ví', en: 'Deposit to Wallet', de: 'Einzahlung auf Wallet' },
    'Lương hàng tháng': { vi: 'Lương hàng tháng', en: 'Monthly Salary', de: 'Monatsgehalt' },
    'Thưởng & Phụ cấp': { vi: 'Thưởng & Phụ cấp', en: 'Bonus & Allowance', de: 'Bonus & Zulage' },
    'Bán hàng & Kinh doanh': { vi: 'Bán hàng & Kinh doanh', en: 'Sales & Business', de: 'Verkauf & Geschäft' },
    'Đầu tư sinh lời': { vi: 'Đầu tư sinh lời', en: 'Investments', de: 'Investitionen' },
    'Thu nhập khác': { vi: 'Thu nhập khác', en: 'Other Income', de: 'Sonstiges Einkommen' },
    'Chi tiêu': { vi: 'Chi tiêu', en: 'Expense', de: 'Ausgabe' },
    'Thu nhập': { vi: 'Thu nhập', en: 'Income', de: 'Einnahme' },
    'Khác': { vi: 'Khác', en: 'Other', de: 'Sonstiges' }
};

function getCategoryName(name) {
    if (!name) return '';
    const item = categoryTranslations[name];
    if (item && item[currentLang]) {
        return item[currentLang];
    }
    return name;
}

// Wallet type dictionary (full labels & short badges)
const walletTypeTranslations = {
    'bank': { 
        full: { vi: '🏦 Tài khoản Ngân hàng', en: '🏦 Bank Account', de: '🏦 Bankkonto' },
        badge: { vi: 'Ngân hàng', en: 'Bank', de: 'Bank' }
    },
    'cash': { 
        full: { vi: '💵 Tiền mặt', en: '💵 Cash', de: '💵 Bargeld' },
        badge: { vi: 'Tiền mặt', en: 'Cash', de: 'Bargeld' }
    },
    'ewallet': { 
        full: { vi: '📱 Ví điện tử', en: '📱 E-Wallet', de: '📱 E-Wallet' },
        badge: { vi: 'Ví điện tử', en: 'E-Wallet', de: 'E-Wallet' }
    },
    'credit': { 
        full: { vi: '💳 Thẻ tín dụng', en: '💳 Credit Card', de: '💳 Kreditkarte' },
        badge: { vi: 'Tín dụng', en: 'Credit', de: 'Kredit' }
    },
    'savings': { 
        full: { vi: '🐷 Tiết kiệm / Heo đất', en: '🐷 Savings / Piggy Bank', de: '🐷 Sparen / Sparschwein' },
        badge: { vi: 'Tiết kiệm', en: 'Savings', de: 'Sparen' }
    }
};

function getWalletTypeName(type, isBadge = false) {
    const item = walletTypeTranslations[type];
    if (item) {
        const dict = isBadge ? item.badge : item.full;
        return dict[currentLang] || dict['vi'] || type;
    }
    return type;
}

let currentLang = localStorage.getItem('pixel_lang') || 'vi';

function t(key, params = {}) {
    const langDict = i18nData[currentLang] || i18nData['vi'];
    let text = langDict[key] || (i18nData['vi'] ? i18nData['vi'][key] : key) || key;
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

function setLanguage(lang) {
    if (!i18nData[lang]) lang = 'vi';
    currentLang = lang;
    localStorage.setItem('pixel_lang', lang);

    // Update document title
    if (t('page_title')) {
        document.title = t('page_title');
    }

    // Update active lang pills
    document.querySelectorAll('.lang-pill').forEach(pill => {
        if (pill.dataset.lang === lang) pill.classList.add('active');
        else pill.classList.remove('active');
    });

    // Update DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (key) el.setAttribute('placeholder', t(key));
    });

    // Update dynamic select dropdowns
    if (typeof populateWalletTypeSelect === 'function') {
        populateWalletTypeSelect();
    }
    if (typeof populateSubCycleSelect === 'function') {
        populateSubCycleSelect();
    }
    if (typeof populateFilterTypeSelect === 'function') {
        populateFilterTypeSelect();
    }
    if (typeof populateCategorySelect === 'function') {
        populateCategorySelect();
    }
    if (typeof populateWalletSelects === 'function') {
        populateWalletSelects();
    }
    if (typeof updateBudgetModalDisplay === 'function') {
        updateBudgetModalDisplay();
    }
    if (typeof renderSubCalendarTable === 'function') {
        renderSubCalendarTable();
    }
    if (typeof handleSubCycleChange === 'function') {
        handleSubCycleChange();
    }
    if (typeof updateTodayDisplay === 'function') {
        updateTodayDisplay();
    }

    // Trigger dashboard refresh for dynamic strings & charts
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    }
}
