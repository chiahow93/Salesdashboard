// 应用初始化和事件处理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有UI
    UIManager.updateAll();

    // 绑定事件监听器
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const period = this.dataset.period;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            UIManager.updateRankingTable(period);
        });
    });

    // 表单提交处理
    const salesForm = document.getElementById('salesForm');
    if (salesForm) {
        salesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            // 获取表单数据并验证
            const salesName = formData.get('salesName');
            const salesAmount = Number(formData.get('salesAmount'));
            let salesDate = formData.get('salesDate');
            const remarks = formData.get('remarks');

            // 如果日期为空，使用今天的日期
            if (!salesDate) {
                const today = new Date();
                salesDate = today.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
                document.getElementById('salesDate').value = salesDate;
            }

            // 验证销售人员
            if (!salesName || salesName.trim() === '') {
                alert('Please select a sales person');
                document.getElementById('salesName').focus();
                return;
            }

            // 验证金额
            if (!salesAmount || salesAmount <= 0) {
                alert('Please enter a valid amount');
                document.getElementById('salesAmount').focus();
                return;
            }

            // 创建销售记录
            const saleRecord = {
                salesName,
                salesAmount,
                salesDate,
                remarks: remarks || ''
            };
            
            try {
                // 添加记录并更新UI
                DataManager.addSaleRecord(saleRecord);
                UIManager.updateAll();
                
                // 重置表单
                this.reset();
                
                // 重新初始化销售人员选择器并设置今天的日期
                UIManager.updateSalespeopleSelect();
                document.getElementById('salesDate').value = new Date().toISOString().split('T')[0];

                // 显示成功消息
                alert('Sales record submitted successfully!');
            } catch (error) {
                console.error('Error submitting sale:', error);
                alert('Error submitting sale. Please try again.');
            }
        });

        // 页面加载时设置默认日期为今天
        document.getElementById('salesDate').value = new Date().toISOString().split('T')[0];
    }
}); 