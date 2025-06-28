import './App.css'
import { useState } from 'react'
import IncomeManager from './IncomeManager'
import DepositManager from './DepositManager'
import PlanManager from './PlanManager'
import SummaryManager from './SummaryManager'
import SettingsManager from './SettingsManager'

const NAVS = [
  { key: 'income', label: '收入管理' },
  { key: 'deposit', label: '存款管理' },
  { key: 'plan', label: '存钱计划' },
  { key: 'summary', label: '年度总结' },
  { key: 'settings', label: '设置' },
]

function App() {
  const [page, setPage] = useState('home')

  function renderPage() {
    switch (page) {
      case 'income':
        return <IncomeManager />
      case 'deposit':
        return <DepositManager />
      case 'plan':
        return <PlanManager />
      case 'summary':
        return <SummaryManager />
      case 'settings':
        return <SettingsManager />
      default:
        return (
          <div className="main-container">
            <h1 className="main-title">女娲补天计划--攒！攒！攒！</h1>
            <p className="main-desc">
              这是一个专为个人打造的收支管理网站，帮助你轻松记录工资、存款、开支与攒钱计划，
              让财务状况一目了然，助你实现每月结余、年度总结和目标管理！
            </p>
            <div className="feature-list">
              <ul>
                <li>💰 收入管理：工资、扣除项、意外收入一站式录入</li>
                <li>🏦 存款管理：多账户余额、月度变化一目了然</li>
                <li>🎯 存钱计划：目标设定、当月进度追踪</li>
                <li>📊 年度总结：总览全年收支与结余</li>
                <li>🗂 数据导入/导出：轻松备份与迁移</li>
              </ul>
            </div>
            <div className="footer">Designed for fun & efficiency · Powered by React + Ant Design</div>
          </div>
        )
    }
  }

  return (
    <div>
      <nav className="top-nav">
        <span className="nav-logo" onClick={() => setPage('home')}>女娲补天计划</span>
        {NAVS.map(nav => (
          <span
            key={nav.key}
            className={page === nav.key ? 'nav-item nav-item-active' : 'nav-item'}
            onClick={() => setPage(nav.key)}
          >
            {nav.label}
          </span>
        ))}
      </nav>
      {renderPage()}
    </div>
  )
}

export default App
