// 数据管理类
class DataManager {
    // 销售数据结构
    static SALES_DATA_KEY = 'salesData';
    static TARGETS_KEY = 'salesTargets';
    static SALESPEOPLE_KEY = 'salespeople';

    // 获取所有销售数据
    static getSalesData() {
        return JSON.parse(localStorage.getItem(this.SALES_DATA_KEY)) || [];
    }

    // 保存销售数据
    static saveSalesData(data) {
        localStorage.setItem(this.SALES_DATA_KEY, JSON.stringify(data));
    }

    // 添加新的销售记录
    static addSaleRecord(record) {
        if (!record.salesName) {
            throw new Error('Sales person is required');
        }

        const salespeople = this.getSalespeople();
        const salesperson = salespeople.find(p => p.name === record.salesName && p.status === 'active');
        if (!salesperson) {
            throw new Error('Invalid or inactive sales person');
        }

        const sales = this.getSalesData();
        const newRecord = {
            id: Date.now(),
            ...record,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        sales.push(newRecord);
        this.saveSalesData(sales);
        return newRecord;
    }

    // 更新销售记录状态
    static updateSaleStatus(id, status) {
        const sales = this.getSalesData();
        const index = sales.findIndex(s => s.id === id);
        if (index !== -1) {
            sales[index].status = status;
            sales[index].updatedAt = new Date().toISOString();
            this.saveSalesData(sales);
            return true;
        }
        return false;
    }

    // 获取目标数据
    static getTargets() {
        return JSON.parse(localStorage.getItem(this.TARGETS_KEY)) || {
            company: {
                monthly: 0,
                quarterly: 0,
                yearly: 0
            },
            individuals: {}
        };
    }

    // 保存目标数据
    static saveTargets(targets) {
        localStorage.setItem(this.TARGETS_KEY, JSON.stringify(targets));
    }

    // 获取销售人员数据
    static getSalespeople() {
        return JSON.parse(localStorage.getItem(this.SALESPEOPLE_KEY)) || [];
    }

    // 保存销售人员数据
    static saveSalespeople(people) {
        localStorage.setItem(this.SALESPEOPLE_KEY, JSON.stringify(people));
    }

    // 添加销售人员
    static addSalesperson(data) {
        const salespeople = this.getSalespeople();
        const newPerson = {
            id: Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };
        salespeople.push(newPerson);
        localStorage.setItem(this.SALESPEOPLE_KEY, JSON.stringify(salespeople));
        return newPerson;
    }

    // 更新销售人员
    static updateSalesperson(id, data) {
        const salespeople = this.getSalespeople();
        const index = salespeople.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Sales person not found');

        salespeople[index] = {
            ...salespeople[index],
            ...data,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(this.SALESPEOPLE_KEY, JSON.stringify(salespeople));
        return salespeople[index];
    }

    // 获取销售统计
    static getSalesMetrics() {
        const sales = this.getSalesData();
        const targets = this.getTargets();
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);

        // 创建日期范围检查函数
        const isInCurrentMonth = (date) => {
            const d = new Date(date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        };

        const isInCurrentQuarter = (date) => {
            const d = new Date(date);
            return d.getFullYear() === currentYear && Math.floor(d.getMonth() / 3) === currentQuarter;
        };

        const isInCurrentYear = (date) => {
            const d = new Date(date);
            return d.getFullYear() === currentYear;
        };

        // 计算销售额
        const metrics = sales.reduce((acc, sale) => {
            if (sale.status !== 'approved') return acc;

            const amount = Number(sale.salesAmount);

            if (isInCurrentMonth(sale.salesDate)) {
                acc.monthSales += amount;
            }
            if (isInCurrentQuarter(sale.salesDate)) {
                acc.quarterSales += amount;
            }
            if (isInCurrentYear(sale.salesDate)) {
                acc.yearToDateSales += amount;
            }

            return acc;
        }, {
            monthSales: 0,
            quarterSales: 0,
            yearToDateSales: 0
        });

        // 计算完成率
        const completion = {
            month: (metrics.monthSales / targets.company.monthly) * 100 || 0,
            quarter: (metrics.quarterSales / targets.company.quarterly) * 100 || 0,
            year: (metrics.yearToDateSales / targets.company.yearly) * 100 || 0
        };

        return { metrics, completion };
    }

    // 获取个人销售业绩
    static getPersonalPerformance(period = 'month') {
        const sales = this.getSalesData();
        const targets = this.getTargets();
        const people = this.getSalespeople().filter(p => p.status === 'active');

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);

        // 根据期间获取目标值
        const getTargetForPeriod = (personName) => {
            const personTargets = targets.individuals[personName] || {};
            switch (period) {
                case 'month':
                    return personTargets.monthly || 0;
                case 'quarter':
                    return personTargets.quarterly || 0;
                case 'year':
                    return personTargets.yearly || 0;
                default:
                    return 0;
            }
        };

        // 根据期间筛选销售数据
        const filteredSales = sales.filter(sale => {
            if (sale.status !== 'approved') return false;
            const saleDate = new Date(sale.salesDate);
            switch (period) {
                case 'month':
                    return saleDate.getFullYear() === currentYear && 
                           saleDate.getMonth() === currentMonth;
                case 'quarter':
                    return saleDate.getFullYear() === currentYear && 
                           Math.floor(saleDate.getMonth() / 3) === currentQuarter;
                case 'year':
                    return saleDate.getFullYear() === currentYear;
                default:
                    return false;
            }
        });

        // 计算每个人的业绩
        return people.map(person => {
            const personSales = filteredSales.filter(sale => sale.salesName === person.name);
            const totalSales = personSales.reduce((sum, sale) => sum + Number(sale.salesAmount), 0);
            const target = getTargetForPeriod(person.name);
            const progress = target ? (totalSales / target) * 100 : 0;

            return {
                ...person,
                sales: totalSales,
                target,
                progress,
                remaining: Math.max(0, target - totalSales),
                dealsCount: personSales.length
            };
        }).sort((a, b) => b.sales - a.sales); // 按销售额降序排序
    }
} 