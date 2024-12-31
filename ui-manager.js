class UIManager {
    // 更新销售统计卡片
    static updateSalesMetrics() {
        const { metrics, completion } = DataManager.getSalesMetrics();
        const targets = DataManager.getTargets();

        // 更新月度卡片
        const monthCard = document.querySelector('.summary-cards .card:nth-child(1)');
        if (monthCard) {
            monthCard.querySelector('.amount').textContent = Utils.formatCurrency(metrics.monthSales);
            monthCard.querySelector('.target-info').textContent = `Target: ${Utils.formatCurrency(targets.company.monthly)}`;
            monthCard.querySelector('.progress-bar').style.width = `${Math.min(completion.month, 100)}%`;
            monthCard.querySelector('.progress-text').textContent = `${completion.month.toFixed(1)}%`;
        }

        // 更新季度卡片
        const quarterCard = document.querySelector('.summary-cards .card:nth-child(2)');
        if (quarterCard) {
            quarterCard.querySelector('.amount').textContent = Utils.formatCurrency(metrics.quarterSales);
            quarterCard.querySelector('.target-info').textContent = `Target: ${Utils.formatCurrency(targets.company.quarterly)}`;
            quarterCard.querySelector('.progress-bar').style.width = `${Math.min(completion.quarter, 100)}%`;
            quarterCard.querySelector('.progress-text').textContent = `${completion.quarter.toFixed(1)}%`;
        }

        // 更新年度卡片
        const yearCard = document.querySelector('.summary-cards .card:nth-child(3)');
        if (yearCard) {
            yearCard.querySelector('.amount').textContent = Utils.formatCurrency(metrics.yearToDateSales);
            yearCard.querySelector('.target-info').textContent = `Target: ${Utils.formatCurrency(targets.company.yearly)}`;
            yearCard.querySelector('.progress-bar').style.width = `${Math.min(completion.year, 100)}%`;
            yearCard.querySelector('.progress-text').textContent = `${completion.year.toFixed(1)}%`;
        }
    }

    // 更新单个统计卡片
    static updateMetricCard(period, amount, completion) {
        const card = document.querySelector(`.card[data-period="${period}"]`);
        if (!card) return;

        card.querySelector('.amount').textContent = Utils.formatCurrency(amount);
        card.querySelector('.progress-bar').style.width = `${Math.min(completion, 100)}%`;
        card.querySelector('.progress-text').textContent = Utils.formatPercentage(completion);
    }

    // 更新销售排名表格
    static updateRankingTable(period = 'month') {
        const performance = DataManager.getPersonalPerformance(period);
        const tbody = document.getElementById('rankingTableBody');
        if (!tbody) return;

        if (performance.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        No sales data available for this period
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = performance.map((person, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            const progressWidth = Math.min(person.progress, 100);
            
            return `
                <tr class="${rankClass}">
                    <td>
                        <div class="rank">${index + 1}</div>
                    </td>
                    <td>
                        <div class="salesperson-info">
                            <img src="${person.avatar || 'https://via.placeholder.com/32'}" 
                                 alt="${person.name}" 
                                 class="avatar"
                            >
                            <div class="person-details">
                                <div class="name">${person.name}</div>
                                <div class="email">${person.email}</div>
                            </div>
                        </div>
                    </td>
                    <td>${Utils.formatCurrency(person.target)}</td>
                    <td>${Utils.formatCurrency(person.sales)}</td>
                    <td>
                        <div class="progress-cell">
                            <div class="progress-bar" style="width: ${progressWidth}%"></div>
                            <span class="progress-text">${Utils.formatPercentage(person.progress)}</span>
                        </div>
                    </td>
                    <td>${Utils.formatCurrency(person.remaining)}</td>
                </tr>
            `;
        }).join('');
    }

    // 更新销售人员选择器
    static updateSalespeopleSelect() {
        const select = document.getElementById('salesName');
        if (!select) return;

        const salespeople = DataManager.getSalespeople();
        const activeSalespeople = salespeople.filter(person => person.status === 'active');

        if (activeSalespeople.length === 0) {
            select.innerHTML = '<option value="">No active sales people</option>';
            return;
        }

        const currentValue = select.value;
        
        // 清空并重建选项
        select.innerHTML = `
            <option value="">Select Sales Person</option>
            ${activeSalespeople.map(person => `
                <option value="${person.name}" ${person.name === currentValue ? 'selected' : ''}>
                    ${person.name}
                </option>
            `).join('')}
        `;

        // 如果当前值不在新的选项中，重置为空
        if (currentValue && !activeSalespeople.some(p => p.name === currentValue)) {
            select.value = '';
        }
    }

    // 更新销售记录表
    static updateSalesTable() {
        const salesData = DataManager.getSalesData();
        const tbody = document.querySelector('.sales-table tbody');
        if (!tbody) return;

        // 筛选待审批的记录并按提交时间降序排序
        const pendingSales = [...salesData]
            .filter(sale => sale.status === 'pending')
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        if (pendingSales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-state">
                        No pending sales records
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pendingSales.map(sale => `
            <tr>
                <td>
                    <div class="salesperson-info">
                        <div class="name">${sale.salesName}</div>
                        ${sale.remarks ? `<div class="remarks">${sale.remarks}</div>` : ''}
                    </div>
                </td>
                <td>${Utils.formatCurrency(sale.salesAmount)}</td>
                <td>${Utils.formatDate(sale.salesDate)}</td>
                <td><span class="status pending">PENDING</span></td>
            </tr>
        `).join('');
    }

    // 更新所有UI元素
    static updateAll() {
        this.updateSalesMetrics();
        this.updateRankingTable();
        this.updateSalespeopleSelect();
        this.updateSalesTable();
    }
} 