# 女娲补天计划--攒！攒！攒！ 开发文档

## 项目概述
个人收支管理网站，帮助用户记录工资、存款、开支与攒钱计划，实现财务状况可视化和目标管理。

## 技术栈
- React 19.1.0
- Vite 7.0.0
- Ant Design 5.26.2
- Ant Design Charts 2.4.0
- dayjs
- localStorage (数据存储)

## 项目结构
```
src/
├── App.jsx              # 主应用组件，包含导航和路由
├── IncomeManager.jsx    # 收入管理模块
├── DepositManager.jsx   # 存款管理模块
├── PlanManager.jsx      # 存钱计划模块
├── SummaryManager.jsx   # 年度总结模块
├── App.css             # 应用样式
└── main.jsx            # 应用入口
```

## 核心功能模块

### 1. 收入管理 (IncomeManager)
- **功能**：记录工资构成、扣除项、意外收入
- **数据**：财发、代发1~4、年金、养老、医保、个税、意外收入
- **计算**：净收入 = 财发+代发1~4-年金-养老-医保-个税+意外收入
- **存储**：localStorage 'incomeRecords'

### 2. 存款管理 (DepositManager) ⭐ 重要更新
- **功能**：记录多账户余额和定期存款
- **数据**：工资卡、支付宝、微信、银行定期
- **定期存款逻辑**：
  - 按月份分别管理，不再跨月份显示
  - 每笔定期包含：金额、存入日期、到期日期
  - 只在存入日~到期日区间内的月份计入总存款
  - 支持添加、编辑、删除操作
- **操作功能**：
  - 新增记录：填写表单 → 保存
  - 编辑记录：点击表格"编辑" → 修改 → 更新
  - 删除记录：点击表格"删除" → 确认删除
- **存储**：localStorage 'depositRecords'

### 3. 存钱计划 (PlanManager)
- **功能**：设定月度攒钱目标，追踪当月进度
- **输入项**：目前支付宝余额、工资卡余额、信用卡支出、本月攒钱目标
- **计算逻辑**：
  - 本月支出 = 上月工资卡+支付宝余额 - (本月支付宝+工资卡余额-信用卡支出)
  - 本月还能花 = 上月净收入 - 本月支出 - 本月攒钱目标
- **特性**：输入项自动带出上次输入值

### 4. 年度总结 (SummaryManager)
- **功能**：年度收支总览和可视化
- **图表**：存款变化折线图、支出变化柱状图
- **计算**：支出 = 当月总存款 - 上月总存款 - 当月净收入
- **汇总**：总收入、总支出、攒下的钱、总资产

### 5. 设置 (SettingsManager) ⭐ 新增功能
- **功能**：数据导入导出、数据管理
- **数据导出**：
  - 导出所有数据为JSON格式
  - 文件名包含时间戳：`女娲补天计划数据备份_YYYY-MM-DD_HH-mm-ss.json`
  - 包含收入、存款、计划等所有记录
  - 使用file-saver库实现文件下载
- **数据导入**：
  - 支持JSON文件导入
  - 导入前自动备份当前数据
  - 数据格式验证和错误提示
  - 导入后自动刷新页面
- **数据管理**：
  - 显示各模块数据统计
  - 清空所有数据功能（危险操作）
  - 详细的使用说明和注意事项
- **存储**：localStorage (salaryRecords, depositRecords, planRecords)

## 重要开发决策

### 1. 数据存储策略
- 使用 localStorage 进行本地存储
- 每个模块独立存储，便于维护和扩展
- 支持数据导入/导出功能

### 2. 定期存款管理逻辑 ⭐
- **问题**：之前定期存款会跨月份显示，删除操作不生效
- **解决方案**：改为按月份分别管理，每个月的定期存款独立存储
- **实现**：移除从其他月份带入定期存款的逻辑，添加编辑功能

### 3. 界面设计
- 采用莫兰迪配色方案，温暖有趣
- 桌面端适配，响应式设计
- 表格支持直接编辑和操作

### 4. 用户体验优化
- 输入项自动记忆上次输入值
- 所有金额保留两位小数
- 时间精度精确到日
- 删除操作使用确认弹窗

## 最近修复的问题

### 删除功能无反应问题
- **原因**：Modal.confirm 可能因样式或依赖问题无法正常显示
- **解决方案**：使用 window.confirm 作为主要删除确认方式
- **状态**：已修复，功能正常

### 定期存款跨月份问题
- **原因**：定期存款从其他月份带入，导致逻辑混乱
- **解决方案**：改为按月份分别管理，添加编辑功能
- **状态**：已修复，逻辑清晰

## 待开发功能
- 数据导入/导出功能
- 设置模块
- 移动端适配优化

## 开发注意事项
1. 所有金额计算使用 Number() 转换，避免字符串拼接
2. 定期存款的计入逻辑基于日期区间判断
3. 表格数据按月份升序排序显示
4. 删除操作需要二次确认
5. 表单验证确保数据完整性

## 联系方式
如有问题或需要继续开发，请提供此文档和项目当前状态。 