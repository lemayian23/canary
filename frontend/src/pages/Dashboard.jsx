import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlayCircle, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock
} from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTestCases: 0,
    totalTestRuns: 0,
    passedTests: 0,
    failedTests: 0,
    recentRuns: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [testCasesRes, testRunsRes] = await Promise.all([
        axios.get('/api/v1/test-cases/'),
        axios.get('/api/v1/test-runs/')
      ])

      const testCases = testCasesRes.data.test_cases || []
      const testRuns = testRunsRes.data || []

      const totalPassed = testRuns.reduce((sum, run) => sum + (run.passed_tests || 0), 0)
      const totalFailed = testRuns.reduce((sum, run) => sum + (run.failed_tests || 0), 0)

      setStats({
        totalTestCases: testCases.length,
        totalTestRuns: testRuns.length,
        passedTests: totalPassed,
        failedTests: totalFailed,
        recentRuns: testRuns.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeTestRun = async () => {
    try {
      await axios.post('/api/v1/test-runs/execute', {}, {
        params: {
          run_name: 'Quick Test Run',
          git_commit: 'dashboard-' + Date.now(),
          git_branch: 'main'
        }
      })
      fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error executing test run:', error)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  const StatusBadge = ({ status }) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      running: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your AI model performance and test results</p>
        </div>
        <button
          onClick={executeTestRun}
          className="btn-primary flex items-center"
        >
          <PlayCircle className="h-5 w-5 mr-2" />
          Run Tests
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Test Cases"
          value={stats.totalTestCases}
          icon={FileText}
          color="text-blue-600"
        />
        <StatCard
          title="Test Runs"
          value={stats.totalTestRuns}
          icon={TrendingUp}
          color="text-purple-600"
        />
        <StatCard
          title="Passed Tests"
          value={stats.passedTests}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="Failed Tests"
          value={stats.failedTests}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      {/* Recent Test Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Test Runs</h2>
          <div className="space-y-4">
            {stats.recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{run.name}</p>
                  <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600">
                    <span>{run.total_tests} tests</span>
                    <span>{run.passed_tests} passed</span>
                    <span>{run.failed_tests} failed</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={run.status} />
                  <Link
                    to={`/test-runs/${run.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
            {stats.recentRuns.length === 0 && (
              <p className="text-gray-500 text-center py-8">No test runs yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/test-cases"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FileText className="h-5 w-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-900">Manage Test Cases</span>
            </Link>
            <Link
              to="/test-runs"
              className="flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <PlayCircle className="h-5 w-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-900">View All Test Runs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard