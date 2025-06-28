import { useState } from 'react'
import { Button, InputNumber, DatePicker, Table, message, Input, Modal } from 'antd'
import dayjs from 'dayjs'
import './App.css'

const currentMonth = dayjs().format('YYYY-MM')

const defaultDeposit = {
  month: currentMonth,
  salaryCard: 0,
  alipay: 0,
  wechat: 0,
  // 定期存款为数组，每项含金额、存入时间、到期时间
  fixeds: [],
}

function getLocalDepositRecords() {
  return JSON.parse(localStorage.getItem('depositRecords') || '[]')
}
function setLocalDepositRecords(records) {
  localStorage.setItem('depositRecords', JSON.stringify(records))
}

function FixedDepositForm({ onAdd, initial, onSave, onCancel }) {
  const [amount, setAmount] = useState(initial ? initial.amount : 0)
  const [start, setStart] = useState(initial ? dayjs(initial.start) : null)
  const [end, setEnd] = useState(initial ? dayjs(initial.end) : null)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
      <InputNumber value={amount} onChange={setAmount} placeholder="定期金额" />
      <DatePicker value={start} onChange={setStart} placeholder="存入时间" />
      <DatePicker value={end} onChange={setEnd} placeholder="到期时间" />
      {onAdd && (
        <Button
          onClick={() => {
            if (!amount || !start || !end) return message.error('请填写完整')
            onAdd({ amount, start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') })
            setAmount(0); setStart(null); setEnd(null)
          }}
        >添加定期</Button>
      )}
      {onSave && (
        <Button type="primary" onClick={() => {
          if (!amount || !start || !end) return message.error('请填写完整')
          onSave({ amount, start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD') })
        }}>保存</Button>
      )}
      {onCancel && (
        <Button onClick={onCancel}>取消</Button>
      )}
    </div>
  )
}

export default function DepositManager() {
  const [form, setForm] = useState(() => {
    // 默认值为空表单，不再从其他月份带入定期存款
    return defaultDeposit
  })
  const [records, setRecords] = useState(getLocalDepositRecords())
  const [editIdx, setEditIdx] = useState(null)
  const [editVisible, setEditVisible] = useState(false)
  const [editInitial, setEditInitial] = useState(null)

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }
  function handleAddFixed(fixed) {
    setForm(f => ({ ...f, fixeds: [...(f.fixeds || []), fixed] }))
  }
  function handleRemoveFixed(idx) {
    setForm(f => ({ ...f, fixeds: f.fixeds.filter((_, i) => i !== idx) }))
  }
  function handleEditFixed(idx) {
    setEditIdx(idx)
    setEditInitial(form.fixeds[idx])
    setEditVisible(true)
  }
  function handleSaveEditFixed(newFixed) {
    setForm(f => ({ ...f, fixeds: f.fixeds.map((item, i) => i === editIdx ? newFixed : item) }))
    setEditVisible(false)
    setEditIdx(null)
    setEditInitial(null)
  }
  function handleCancelEditFixed() {
    setEditVisible(false)
    setEditIdx(null)
    setEditInitial(null)
  }

  function handleSave() {
    // 检查月份唯一
    if (records.some(r => r.month === form.month)) {
      message.error('该月份已存在记录，请修改月份或删除原有记录')
      return
    }
    const newRecords = [...records, form]
    setRecords(newRecords)
    setLocalDepositRecords(newRecords)
    message.success('保存成功！')
    // 保存后清空表单
    setForm(defaultDeposit)
  }

  // 编辑已保存的记录
  function handleEditRecord(record) {
    setForm({ ...record })
    message.info(`正在编辑${record.month}的记录`)
  }

  // 更新已保存的记录
  function handleUpdateRecord() {
    const existingIndex = records.findIndex(r => r.month === form.month)
    if (existingIndex === -1) {
      message.error('未找到该月份记录')
      return
    }
    const newRecords = [...records]
    newRecords[existingIndex] = form
    setRecords(newRecords)
    setLocalDepositRecords(newRecords)
    message.success('更新成功！')
    // 更新后清空表单
    setForm(defaultDeposit)
  }

  // 计算某月总存款，定期只计入在存入日及之后、到期日及之前的定期
  function getTotalWithFixeds(r) {
    const monthStart = dayjs(r.month + '-01')
    const monthEnd = monthStart.endOf('month')
    const fixedSum = (r.fixeds || []).reduce((sum, f) => {
      const start = dayjs(f.start)
      const end = dayjs(f.end)
      // 只要本月有一天在存入日和到期日之间，就计入
      if (monthEnd.isBefore(start) || monthStart.isAfter(end)) return sum
      return sum + Number(f.amount)
    }, 0)
    return r.salaryCard + r.alipay + r.wechat + fixedSum
  }

  // 删除某月记录
  function handleDeleteRow(month) {
    console.log('删除按钮被点击，月份:', month)
    
    if (window.confirm(`确认删除${month}的存款记录吗？删除后将无法恢复。`)) {
      console.log('确认删除，月份:', month)
      const newRecords = records.filter(r => r.month !== month)
      setRecords(newRecords)
      setLocalDepositRecords(newRecords)
      message.success('删除成功')
    } else {
      console.log('取消删除')
    }
  }

  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '工资卡', dataIndex: 'salaryCard', key: 'salaryCard' },
    { title: '支付宝', dataIndex: 'alipay', key: 'alipay' },
    { title: '微信', dataIndex: 'wechat', key: 'wechat' },
    {
      title: '定期存款',
      key: 'fixeds',
      render: (_, r) =>
        (r.fixeds || []).map((f) => `${f.amount}元(${f.start}~${f.end})`).join('；') || '-',
    },
    {
      title: '总存款',
      key: 'total',
      render: (_, r) => getTotalWithFixeds(r),
    },
    {
      title: '存款变化',
      key: 'change',
      render: (_, r) => {
        // 先按月份排序
        const sorted = [...records].sort((a, b) => a.month.localeCompare(b.month))
        const thisIdx = sorted.findIndex(item => item.month === r.month)
        if (thisIdx === 0) return ''
        const last = sorted[thisIdx - 1]
        if (!last) return ''
        const change = getTotalWithFixeds(r) - getTotalWithFixeds(last)
        return change.toFixed(2)
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button 
            size="small" 
            onClick={() => {
              console.log('编辑按钮点击事件触发，月份:', r.month)
              handleEditRecord(r)
            }}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => {
              console.log('删除按钮点击事件触发，月份:', r.month)
              handleDeleteRow(r.month)
            }}
          >
            删除
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="deposit-manager">
      <h2>存款管理</h2>
      <div className="deposit-form">
        <div style={{ marginBottom: '1rem' }}>
          <label>月份：</label>
          <Input style={{ width: 120 }} value={form.month} onChange={e => handleChange('month', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label>工资卡：</label>
          <InputNumber value={form.salaryCard} onChange={v => handleChange('salaryCard', v)} />
          <label>支付宝：</label>
          <InputNumber value={form.alipay} onChange={v => handleChange('alipay', v)} />
          <label>微信：</label>
          <InputNumber value={form.wechat} onChange={v => handleChange('wechat', v)} />
        </div>
      </div>
      <div style={{ margin: '1rem 0' }}>
        <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
          <label style={{ color: '#1a1a1a' }}>银行定期：</label>
        </div>
        <FixedDepositForm onAdd={handleAddFixed} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(form.fixeds || []).map((f, i) => (
            <span key={i} className="fixed-deposit-item">
              {f.amount}元({f.start}~{f.end})
              <Button size="small" type="link" onClick={() => handleEditFixed(i)} style={{ color: '#3b7a57' }}>编辑</Button>
              <Button size="small" type="link" onClick={() => handleRemoveFixed(i)} style={{ color: '#b97a57' }}>删除</Button>
            </span>
          ))}
        </div>
        <Modal open={editVisible} footer={null} onCancel={handleCancelEditFixed} title="编辑定期存款">
          <FixedDepositForm initial={editInitial} onSave={handleSaveEditFixed} onCancel={handleCancelEditFixed} />
        </Modal>
      </div>
      <Button type="primary" onClick={records.some(r => r.month === form.month) ? handleUpdateRecord : handleSave}>
        {records.some(r => r.month === form.month) ? '更新' : '保存'}
      </Button>
      <Button style={{ marginLeft: 8 }} onClick={() => setForm(defaultDeposit)}>
        清空表单
      </Button>
      <div style={{ marginTop: 32 }}>
        <Table columns={columns} dataSource={[...records].sort((a, b) => a.month.localeCompare(b.month))} rowKey="month" pagination={false} bordered size="small" />
      </div>
    </div>
  )
} 