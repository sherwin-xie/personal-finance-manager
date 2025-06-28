import { useState } from 'react'
import { Select, Typography, Row, Col, Divider } from 'antd'
import { Line, Column } from '@ant-design/charts'
import dayjs from 'dayjs'

function getLocalSalaryRecords() {
  return JSON.parse(localStorage.getItem('salaryRecords') || '[]')
}
function getLocalDepositRecords() {
  return JSON.parse(localStorage.getItem('depositRecords') || '[]')
}

const months = ['01','02','03','04','05','06','07','08','09','10','11','12']

export default function SummaryManager() {
  const salaryRecords = getLocalSalaryRecords()
  const depositRecords = getLocalDepositRecords()
  // 年份列表
  const allYears = Array.from(new Set([
    ...salaryRecords.map(r => r.month.slice(0,4)),
    ...depositRecords.map(r => r.month.slice(0,4)),
  ])).filter(Boolean).sort()
  const currentYear = dayjs().format('YYYY')
  const [year, setYear] = useState(allYears.includes(currentYear) ? currentYear : (allYears[0] || currentYear))

  // 生成每月数据
  const depositByMonth = {}
  depositRecords.filter(r => r.month.startsWith(year)).forEach(r => {
    depositByMonth[r.month.slice(5,7)] = r.salaryCard + r.alipay + r.wechat + (r.fixeds||[]).reduce((sum,f)=>sum+Number(f.amount),0)
  })
  const salaryByMonth = {}
  salaryRecords.filter(r => r.month.startsWith(year)).forEach(r => {
    salaryByMonth[r.month.slice(5,7)] = r.caifa + r.daifa1 + r.daifa2 + r.daifa3 + r.daifa4 - r.pension - r.oldage - r.medical - r.tax + r.otherIncome
  })

  // 存款变化图表数据
  const depositChartData = months.map(m => ({
    month: m+'月',
    value: depositByMonth[m] !== undefined ? Number(depositByMonth[m].toFixed(2)) : null
  }))

  // 支出变化图表数据
  let lastDeposit = null
  const expenseChartData = months.map(m => {
    const thisDeposit = depositByMonth[m]
    const thisSalary = salaryByMonth[m] || 0
    let expense = null
    if (thisDeposit !== undefined && lastDeposit !== null) {
      const depositChange = thisDeposit - lastDeposit
      expense = thisSalary - depositChange
      expense = Number(expense.toFixed(2))
    }
    const res = { month: m+'月', value: expense }
    lastDeposit = thisDeposit !== undefined ? thisDeposit : lastDeposit
    return res
  })

  // 年度汇总
  const totalIncome = months.reduce((sum, m) => sum + (salaryByMonth[m] || 0), 0)
  const totalExpense = expenseChartData.reduce((sum, d) => sum + (d.value || 0), 0)
  
  // 修复攒下的计算逻辑：总收入 - 总支出
  const saved = totalIncome - totalExpense
  
  // 添加调试信息
  console.log('年度汇总计算:', {
    year,
    totalIncome,
    totalExpense,
    saved,
    salaryByMonth,
    expenseChartData,
    depositByMonth
  })
  
  // 添加支出计算详细调试
  console.log('支出计算详情:', expenseChartData.map(item => ({
    month: item.month,
    value: item.value,
    explanation: item.value !== null ? 
      `支出 = 收入 - (当月存款 - 上月存款) = ${salaryByMonth[item.month.slice(0,2)] || 0} - (${depositByMonth[item.month.slice(0,2)] || 0} - ${lastDeposit || 0})` : 
      '无数据'
  })))
  
  // 总资产：12月有数据用12月，否则用最后一个有数据的月
  let totalAsset = null
  for(let i=months.length-1;i>=0;i--){
    if(depositByMonth[months[i]]!==undefined){ totalAsset = depositByMonth[months[i]]; break; }
  }

  return (
    <div style={{maxWidth:900,margin:'0 auto',background:'#f6f5f3',borderRadius:18,padding:'2.5rem 2rem',boxShadow:'0 4px 32px 0 rgba(120,120,120,0.06)'}}>
      <Typography.Title level={2} style={{color:'#6d7268'}}>年度总结</Typography.Title>
      <div style={{marginBottom:24}}>
        <span style={{fontWeight:600, color:'#1a1a1a'}}>选择年份：</span>
        <Select value={year} onChange={setYear} style={{width:120}}>
          {allYears.map(y=>(<Select.Option key={y} value={y}>{y}</Select.Option>))}
        </Select>
      </div>
      <Row gutter={32}>
        <Col span={12}>
          <Typography.Title level={4}>存款变化</Typography.Title>
          <Line data={depositChartData} xField="month" yField="value" point={{size:4}} yAxis={{label:{formatter:v=>v===null?'':v}}} xAxis={{label:{autoHide:true}}} smooth height={260} />
        </Col>
        <Col span={12}>
          <Typography.Title level={4}>支出变化</Typography.Title>
          <Column data={expenseChartData} xField="month" yField="value" yAxis={{label:{formatter:v=>v===null?'':v}}} xAxis={{label:{autoHide:true}}} height={260} />
        </Col>
      </Row>
      <Divider />
      <div style={{fontSize:'1.2rem',fontWeight:700,marginTop:24}}>
        <span style={{marginRight:32, color:'#1a1a1a'}}>总收入：<span style={{color:'#3b7a57'}}>{totalIncome.toFixed(2)} 元</span></span>
        <span style={{marginRight:32, color:'#1a1a1a'}}>总支出：<span style={{color:'#b97a57'}}>{totalExpense.toFixed(2)} 元</span></span>
        <span style={{marginRight:32, color:'#1a1a1a'}}>攒下：<span style={{color:'#6d7268'}}>{saved.toFixed(2)} 元</span></span>
        <span style={{color:'#1a1a1a'}}>总资产：<span style={{color:'#1a1a1a'}}>{totalAsset!==null?totalAsset.toFixed(2):'—'} 元</span></span>
      </div>
    </div>
  )
} 