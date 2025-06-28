import { useState } from 'react'
import { Button, Input, InputNumber, DatePicker, Table, message } from 'antd'
import dayjs from 'dayjs'
import './App.css'

const currentMonth = dayjs().format('YYYY-MM')

const defaultSalary = {
  month: currentMonth,
  caifa: 0,
  daifa1: 0,
  daifa2: 0,
  daifa3: 0,
  daifa4: 0,
  pension: 0,
  oldage: 0,
  medical: 0,
  tax: 0,
  otherIncome: 0,
  otherRemark: '',
}

function getLocalSalaryRecords() {
  return JSON.parse(localStorage.getItem('salaryRecords') || '[]')
}
function setLocalSalaryRecords(records) {
  localStorage.setItem('salaryRecords', JSON.stringify(records))
}

export default function IncomeManager() {
  const [form, setForm] = useState(() => {
    // 默认值为上月数据
    const records = getLocalSalaryRecords()
    if (records.length > 0) {
      const last = records[records.length - 1]
      return { ...defaultSalary, ...last, month: currentMonth }
    }
    return defaultSalary
  })
  const [records, setRecords] = useState(getLocalSalaryRecords())

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleSave() {
    // 如果该月份已存在，则覆盖
    let newRecords
    if (records.some(r => r.month === form.month)) {
      newRecords = records.map(r => r.month === form.month ? form : r)
      message.success('已覆盖该月份记录！')
    } else {
      newRecords = [...records, form]
      message.success('保存成功！')
    }
    setRecords(newRecords)
    setLocalSalaryRecords(newRecords)
  }

  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '财发', dataIndex: 'caifa', key: 'caifa' },
    { title: '代发1', dataIndex: 'daifa1', key: 'daifa1' },
    { title: '代发2', dataIndex: 'daifa2', key: 'daifa2' },
    { title: '代发3', dataIndex: 'daifa3', key: 'daifa3' },
    { title: '代发4', dataIndex: 'daifa4', key: 'daifa4' },
    { title: '年金', dataIndex: 'pension', key: 'pension' },
    { title: '养老', dataIndex: 'oldage', key: 'oldage' },
    { title: '医保', dataIndex: 'medical', key: 'medical' },
    { title: '个税', dataIndex: 'tax', key: 'tax' },
    { title: '意外收入', dataIndex: 'otherIncome', key: 'otherIncome' },
    { title: '备注', dataIndex: 'otherRemark', key: 'otherRemark' },
    {
      title: '净收入',
      key: 'net',
      render: (_, r) => {
        const net = r.caifa + r.daifa1 + r.daifa2 + r.daifa3 + r.daifa4
          - r.pension - r.oldage - r.medical - r.tax
          + r.otherIncome;
        return net.toFixed(2); // 保留两位小数
      }
    },
  ]

  return (
    <div className="income-manager">
      <h2>收入管理</h2>
      <div className="income-form">
        <label>月份：</label>
        <Input style={{ width: 120 }} value={form.month} onChange={e => handleChange('month', e.target.value)} />
        <label>财发：</label>
        <InputNumber value={form.caifa} onChange={v => handleChange('caifa', v)} />
        <label>代发1：</label>
        <InputNumber value={form.daifa1} onChange={v => handleChange('daifa1', v)} />
        <label>代发2：</label>
        <InputNumber value={form.daifa2} onChange={v => handleChange('daifa2', v)} />
        <label>代发3：</label>
        <InputNumber value={form.daifa3} onChange={v => handleChange('daifa3', v)} />
        <label>代发4：</label>
        <InputNumber value={form.daifa4} onChange={v => handleChange('daifa4', v)} />
        <label>年金：</label>
        <InputNumber value={form.pension} onChange={v => handleChange('pension', v)} />
        <label>养老：</label>
        <InputNumber value={form.oldage} onChange={v => handleChange('oldage', v)} />
        <label>医保：</label>
        <InputNumber value={form.medical} onChange={v => handleChange('medical', v)} />
        <label>个税：</label>
        <InputNumber value={form.tax} onChange={v => handleChange('tax', v)} />
        <label>意外收入：</label>
        <InputNumber value={form.otherIncome} onChange={v => handleChange('otherIncome', v)} />
        <label>备注：</label>
        <Input value={form.otherRemark} maxLength={300} onChange={e => handleChange('otherRemark', e.target.value)} />
        <Button type="primary" onClick={handleSave} style={{ marginLeft: 16 }}>保存</Button>
      </div>
      <div style={{ marginTop: 32 }}>
        <Table columns={columns} dataSource={[...records].sort((a, b) => a.month.localeCompare(b.month))} rowKey="month" pagination={false} bordered size="small" />
      </div>
    </div>
  )
} 