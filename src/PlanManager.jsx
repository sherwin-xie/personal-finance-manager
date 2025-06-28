import { useState, useEffect } from 'react'
import { InputNumber, Table } from 'antd'
import dayjs from 'dayjs'
import './App.css'

function getLocalSalaryRecords() {
  return JSON.parse(localStorage.getItem('salaryRecords') || '[]')
}
function getLocalDepositRecords() {
  return JSON.parse(localStorage.getItem('depositRecords') || '[]')
}
function getPlanInputs() {
  return JSON.parse(localStorage.getItem('planInputs') || '{}')
}
function setPlanInputs(inputs) {
  localStorage.setItem('planInputs', JSON.stringify(inputs))
}

const monthNames = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

export default function PlanManager() {
  const now = dayjs()
  const monthLabel = `${monthNames[now.month()]}月攒钱计划`
  const nowMonth = now.format('YYYY-MM')
  const lastMonth = dayjs().subtract(1, 'month').format('YYYY-MM')

  // 获取上个月存款信息
  const depositRecords = getLocalDepositRecords()
  const lastDeposit = depositRecords.find(r => r.month === lastMonth)
  const lastSalaryCard = lastDeposit ? Number(lastDeposit.salaryCard) : 0
  const lastAlipay = lastDeposit ? Number(lastDeposit.alipay) : 0
  const lastTotal = lastSalaryCard + lastAlipay

  // 获取上月净收入
  const salaryRecords = getLocalSalaryRecords()
  const lastSalary = salaryRecords.find(r => r.month === lastMonth)
  let lastNetIncome = 0
  if (lastSalary) {
    lastNetIncome = lastSalary.caifa + lastSalary.daifa1 + lastSalary.daifa2 + lastSalary.daifa3 + lastSalary.daifa4 - lastSalary.pension - lastSalary.oldage - lastSalary.medical - lastSalary.tax + lastSalary.otherIncome
  }

  // 输入项，默认值为上次输入
  const lastInputs = getPlanInputs()
  const [alipay, setAlipay] = useState(lastInputs.alipay || 0)
  const [salaryCard, setSalaryCard] = useState(lastInputs.salaryCard || 0)
  const [credit, setCredit] = useState(lastInputs.credit || 0)
  const [target, setTarget] = useState(lastInputs.target || 0)

  // 持久化输入项
  useEffect(() => {
    setPlanInputs({ alipay, salaryCard, credit, target })
  }, [alipay, salaryCard, credit, target])

  // 计算本月支出
  const thisMonthExpense = lastTotal - (alipay + salaryCard - credit)
  // 计算还能花
  const canSpend = lastNetIncome - thisMonthExpense - target

  const tableData = [
    {
      lastNetIncome: lastSalary ? lastNetIncome.toFixed(2) : '—',
      thisMonthExpense: lastDeposit ? thisMonthExpense.toFixed(2) : '—',
      target: target ? target.toFixed(2) : '—',
      canSpend: lastSalary && lastDeposit ? canSpend.toFixed(2) : '—',
    },
  ]

  const columns = [
    { title: '上个月净收入', dataIndex: 'lastNetIncome', key: 'lastNetIncome' },
    { title: '目前本月支出', dataIndex: 'thisMonthExpense', key: 'thisMonthExpense' },
    { title: '攒钱目标', dataIndex: 'target', key: 'target' },
    { title: '本月还能花', dataIndex: 'canSpend', key: 'canSpend',
      render: (val) => <span style={{ color: Number(val) < 0 ? 'red' : '#3b7a57', fontWeight: 600 }}>{val}</span>
    },
  ]

  return (
    <div className="plan-manager">
      <h2>{monthLabel}</h2>
      <div className="plan-form">
        <label>目前的支付宝余额（元）：</label>
        <InputNumber value={alipay} onChange={setAlipay} min={0} />
        <label>目前的工资卡余额（元）：</label>
        <InputNumber value={salaryCard} onChange={setSalaryCard} min={0} />
        <label>信用卡等支出（元）：</label>
        <InputNumber value={credit} onChange={setCredit} min={0} />
        <label>本月攒钱目标（元）：</label>
        <InputNumber value={target} onChange={setTarget} min={0} />
      </div>
      <div style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
          size="middle"
        />
      </div>
    </div>
  )
} 