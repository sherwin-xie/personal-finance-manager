import { useState } from 'react'
import { Button, Input, InputNumber, Select, Table, message, Modal } from 'antd'
import dayjs from 'dayjs'
import './App.css'

const defaultCategories = [
  '交通', '吃饭', '购物', '日常生活', '房租', '旅行', '恋爱', '特殊情况'
]

function getLocalExpenseRecords() {
  return JSON.parse(localStorage.getItem('expenseRecords') || '[]')
}
function setLocalExpenseRecords(records) {
  localStorage.setItem('expenseRecords', JSON.stringify(records))
}
function getLocalCategories() {
  return JSON.parse(localStorage.getItem('expenseCategories') || '[]')
}
function setLocalCategories(cats) {
  localStorage.setItem('expenseCategories', JSON.stringify(cats))
}

export default function ExpenseManager() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [records, setRecords] = useState(getLocalExpenseRecords())
  const [categories, setCategories] = useState(() => {
    const local = getLocalCategories()
    return local.length ? local : [...defaultCategories]
  })
  const [form, setForm] = useState({
    category: categories[0],
    amount: 0,
    remark: '',
    month: dayjs().format('YYYY-MM'),
  })
  const [newCat, setNewCat] = useState('')
  const [catModal, setCatModal] = useState(false)

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }
  function handleAdd() {
    if (!form.amount || !form.category) return message.error('请填写完整')
    const newRec = { ...form, month }
    const newRecords = [...records, newRec]
    setRecords(newRecords)
    setLocalExpenseRecords(newRecords)
    setForm(f => ({ ...f, amount: 0, remark: '' }))
    message.success('添加成功！')
  }
  function handleDelete(idx) {
    Modal.confirm({
      title: '确认删除这条开支记录吗？',
      onOk: () => {
        const newRecords = records.filter((_, i) => i !== idx)
        setRecords(newRecords)
        setLocalExpenseRecords(newRecords)
      }
    })
  }
  function handleAddCat() {
    if (!newCat.trim()) return
    if (categories.includes(newCat.trim())) return message.error('分类已存在')
    const newCats = [...categories, newCat.trim()]
    setCategories(newCats)
    setLocalCategories(newCats)
    setNewCat('')
    message.success('添加分类成功')
  }
  function handleDeleteCat(cat) {
    Modal.confirm({
      title: `确认删除分类"${cat}"吗？`,
      onOk: () => {
        const newCats = categories.filter(c => c !== cat)
        setCategories(newCats)
        setLocalCategories(newCats)
        // 删除该分类下的所有记录
        const newRecords = records.filter(r => r.category !== cat)
        setRecords(newRecords)
        setLocalExpenseRecords(newRecords)
      }
    })
  }

  const columns = [
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '金额', dataIndex: 'amount', key: 'amount' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_, r, idx) => <Button size="small" danger onClick={() => handleDelete(idx)}>删除</Button>
    }
  ]

  return (
    <div className="expense-manager">
      <h2>开支记录</h2>
      <div className="expense-form">
        <label>月份：</label>
        <Input style={{ width: 120 }} value={month} onChange={e => setMonth(e.target.value)} />
        <Button onClick={() => setCatModal(true)} style={{ marginLeft: 16 }}>管理分类</Button>
      </div>
      <div className="expense-form">
        <label>分类：</label>
        <Select style={{ width: 120 }} value={form.category} onChange={v => handleChange('category', v)}>
          {categories.map(cat => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
        </Select>
        <label>金额：</label>
        <InputNumber value={form.amount} onChange={v => handleChange('amount', v)} />
        <label>备注：</label>
        <Input value={form.remark} maxLength={300} onChange={e => handleChange('remark', e.target.value)} />
        <Button type="primary" onClick={handleAdd} style={{ marginLeft: 16 }}>添加</Button>
      </div>
      <div style={{ marginTop: 32 }}>
        <Table
          columns={columns}
          dataSource={records.filter(r => r.month === month)}
          rowKey={(_, i) => i}
          pagination={false}
          bordered
          size="small"
          summary={pageData => {
            const total = pageData.reduce((sum, r) => sum + Number(r.amount), 0)
            return <Table.Summary.Row><Table.Summary.Cell index={0}>合计</Table.Summary.Cell><Table.Summary.Cell index={1}>{total}</Table.Summary.Cell><Table.Summary.Cell index={2} colSpan={2} /></Table.Summary.Row>
          }}
        />
      </div>
      <Modal open={catModal} onCancel={() => setCatModal(false)} footer={null} title="管理分类">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="新分类名" />
          <Button onClick={handleAddCat}>添加</Button>
        </div>
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {categories.map(cat => (
            <li key={cat} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{cat}</span>
              {!defaultCategories.includes(cat) && <Button size="small" danger onClick={() => handleDeleteCat(cat)}>删除</Button>}
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  )
} 