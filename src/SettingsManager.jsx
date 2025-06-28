import { useState } from 'react'
import { Button, Upload, message, Card, Typography, Space, Divider, Alert } from 'antd'
import { UploadOutlined, DownloadOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// 获取所有本地存储的数据
function getAllLocalData() {
  const data = {}
  const keys = ['salaryRecords', 'depositRecords', 'planRecords']
  
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      data[key] = JSON.parse(value)
    }
  })
  
  return {
    exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0.0',
    data
  }
}

// 验证导入数据格式
function validateImportData(data) {
  console.log('验证导入数据:', data)
  
  if (!data || typeof data !== 'object') {
    return { valid: false, message: '数据格式错误' }
  }
  
  if (!data.data || typeof data.data !== 'object') {
    return { valid: false, message: '数据内容格式错误' }
  }
  
  // 放宽验证条件，只要data对象存在即可
  const dataKeys = Object.keys(data.data)
  if (dataKeys.length === 0) {
    return { valid: false, message: '数据内容为空' }
  }
  
  console.log('数据验证通过，包含字段:', dataKeys)
  return { valid: true }
}

export default function SettingsManager() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState(() => getDataStats())

  // 获取当前数据统计
  function getDataStats() {
    const data = getAllLocalData()
    const stats = {
      salaryRecords: data.data.salaryRecords?.length || 0,
      depositRecords: data.data.depositRecords?.length || 0,
      planRecords: data.data.planRecords?.length || 0
    }
    return stats
  }

  // 手动刷新统计
  const refreshStats = () => {
    const newStats = getDataStats()
    setStats(newStats)
    console.log('统计已刷新:', newStats)
  }

  // 导出数据
  const handleExport = async () => {
    setExporting(true)
    try {
      const exportData = getAllLocalData()
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const fileName = `女娲补天计划数据备份_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
      saveAs(blob, fileName)
      
      message.success('数据导出成功！')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('数据导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 导入数据
  const handleImport = (file) => {
    console.log('开始导入文件:', file.name)
    setImporting(true)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        console.log('文件读取完成，开始解析JSON')
        const importData = JSON.parse(e.target.result)
        console.log('JSON解析成功:', importData)
        
        const validation = validateImportData(importData)
        
        if (!validation.valid) {
          message.error(validation.message)
          setImporting(false)
          return
        }
        
        console.log('数据验证通过，开始备份当前数据')
        
        // 备份当前数据
        const backupData = getAllLocalData()
        const backupFileName = `备份_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`
        const backupBlob = new Blob([JSON.stringify(backupData, null, 2)], {
          type: 'application/json'
        })
        saveAs(backupBlob, backupFileName)
        
        console.log('备份完成，开始导入新数据')
        
        // 导入新数据
        Object.entries(importData.data).forEach(([key, value]) => {
          console.log(`导入字段 ${key}:`, value)
          localStorage.setItem(key, JSON.stringify(value))
        })
        
        console.log('数据导入完成，准备刷新页面')
        message.success('数据导入成功！当前数据已备份')
        
        // 立即刷新统计
        refreshStats()
        
        // 强制刷新页面以应用新数据
        setTimeout(() => {
          console.log('执行页面刷新')
          try {
            window.location.reload()
          } catch (error) {
            console.error('页面刷新失败:', error)
            // 备用刷新方法
            window.location.replace(window.location.href)
          }
        }, 2000)
        
      } catch (error) {
        console.error('导入失败:', error)
        message.error('数据导入失败，请检查文件格式')
      } finally {
        setImporting(false)
      }
    }
    
    reader.onerror = (error) => {
      console.error('文件读取失败:', error)
      message.error('文件读取失败，请重试')
      setImporting(false)
    }
    
    reader.readAsText(file)
    return false // 阻止默认上传行为
  }

  // 清空所有数据
  const handleClearAll = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      const keys = ['salaryRecords', 'depositRecords', 'planRecords']
      keys.forEach(key => localStorage.removeItem(key))
      message.success('所有数据已清空')
      
      // 刷新页面
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', background: '#f6f5f3', borderRadius: 18, padding: '2.5rem 2rem', boxShadow: '0 4px 32px 0 rgba(120,120,120,0.06)' }}>
      <Title level={2} style={{ color: '#6d7268', marginBottom: 32 }}>设置</Title>
      
      {/* 数据统计 */}
      <Card 
        title="数据统计" 
        style={{ marginBottom: 24 }}
        extra={
          <Button size="small" onClick={refreshStats}>
            刷新统计
          </Button>
        }
      >
        <Space size="large">
          <div>
            <Text strong>收入记录：</Text>
            <Text style={{ color: '#3b7a57' }}>{stats.salaryRecords} 条</Text>
          </div>
          <div>
            <Text strong>存款记录：</Text>
            <Text style={{ color: '#3b7a57' }}>{stats.depositRecords} 条</Text>
          </div>
          <div>
            <Text strong>计划记录：</Text>
            <Text style={{ color: '#3b7a57' }}>{stats.planRecords} 条</Text>
          </div>
        </Space>
      </Card>

      {/* 数据导出 */}
      <Card title="数据导出" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>导出所有数据为JSON文件，包含收入、存款、计划等所有记录。</Text>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={exporting}
            size="large"
          >
            导出数据
          </Button>
        </Space>
      </Card>

      {/* 数据导入 */}
      <Card title="数据导入" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>从JSON文件导入数据，导入前会自动备份当前数据。</Text>
          <Upload
            accept=".json"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button 
              icon={<UploadOutlined />} 
              loading={importing}
              size="large"
            >
              选择文件导入
            </Button>
          </Upload>
        </Space>
      </Card>

      {/* 数据管理 */}
      <Card title="数据管理" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="危险操作"
            description="清空所有数据将删除所有记录，此操作不可恢复！"
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleClearAll}
            size="large"
          >
            清空所有数据
          </Button>
        </Space>
      </Card>

      {/* 使用说明 */}
      <Card title="使用说明">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>数据备份建议：</Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>定期导出数据备份，建议每月备份一次</li>
            <li>导入数据前会自动备份当前数据</li>
            <li>备份文件包含时间戳，便于区分不同版本</li>
            <li>数据格式为JSON，可用文本编辑器查看</li>
          </ul>
          
          <Divider />
          
          <Text strong>注意事项：</Text>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>导入数据会覆盖现有数据，请谨慎操作</li>
            <li>清空数据操作不可恢复，请确认后再操作</li>
            <li>建议在浏览器清理缓存前先导出数据</li>
            <li>如遇问题，可重新导入之前的备份文件</li>
          </ul>
        </Space>
      </Card>
    </div>
  )
} 