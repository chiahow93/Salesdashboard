// 工具函数
const Utils = {
    // 格式化金额
    formatCurrency(amount) {
        return `RM ${Number(amount).toLocaleString()}`;
    },

    // 格式化日期
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },

    // 格式化百分比
    formatPercentage(value) {
        return `${value.toFixed(1)}%`;
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}; 