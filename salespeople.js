// 销售员数据结构
const defaultSalespeople = [
    {
        id: 1,
        name: "John Smith",
        avatar: "https://via.placeholder.com/40",
        email: "john.smith@company.com",
        status: "active"
    },
    // 可以添加更多默认销售员...
];

// 初始化销售员数据
if (!localStorage.getItem('salespeople')) {
    localStorage.setItem('salespeople', JSON.stringify(defaultSalespeople));
}

// 获取所有销售员
function getAllSalespeople() {
    const salespeople = JSON.parse(localStorage.getItem('salespeople')) || [];
    return salespeople;
}

// 添加新销售员
function addSalesperson(person) {
    const salespeople = getAllSalespeople();
    salespeople.push(person);
    localStorage.setItem('salespeople', JSON.stringify(salespeople));
}

// 更新销售员信息
function updateSalesperson(id, data) {
    const salespeople = getAllSalespeople();
    const index = salespeople.findIndex(sp => sp.id === id);
    if (index !== -1) {
        salespeople[index] = { ...salespeople[index], ...data };
        localStorage.setItem('salespeople', JSON.stringify(salespeople));
    }
} 