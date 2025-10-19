import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  GitBranch, 
  Hash, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign
} from 'lucide-react'
import axios from 'axios'

const TestRunDetail = () => {
  const { id } = useParams()
  const [testRun, setTestRun] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState('all')

  useEffect(() => {
    fetchTestRunDetails()
  }, [id])

  const fetchTestRunDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/test-runs/${id}/results`)
      setTestRun(response.data.test_run)
      setResults(response.data.results || [])
    } catch (error) {
      console.error('Error fetching test run details:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const SeverityBadge = ({ severity }) => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      none: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[severity] || 'bg-gray-100 text-gray-800'}`}>
        {severity}
      </span>
    )
  }

  const RegressionBadge = ({ isRegression }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isRegression 
        ? 'bg-red-100 text-red-800' 
        : 'bg-green-100 text-green-800'
    }`}>
      {isRegression ? 'Regression' : 'No Regression'}
    </span>
  )

  const filteredResults = results.filter(result => 
    severityFilter === 'all' || result.severity_label === severityFilter
  )

  const severityCounts = results.reduce((acc, result) => {
    const severity = result.severity_label || 'unknown'
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {})

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Test run not found</h3>
        <Link to="/test-runs" className="btn-primary">
          Back to Test Runs
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/test-runs"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{testRun.name}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(testRun.created_at)}
              </div>
              {testRun.git_commit && (
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-1" />
                  {testRun.git_commit.substring(0, 8)}
                </div>
              )}
              {testRun.git_branch && (
                <div className="flex items-center">
                  <GitBranch className="h-4 w-4 mr-1" />
                  {testRun.git_branch}
                </div>
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={testRun.status} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 bg-opacity-10">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{testRun.total_tests}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 bg-opacity-10">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-green-600">{testRun.passed_tests}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 bg-opacity-10">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{testRun.failed_tests}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 bg-opacity-10">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${testRun.total_cost?.toFixed(4) || '0.0000'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Severity Distribution</h2>
        <div className="flex flex-wrap gap-4">
          {Object.entries(severityCounts).map(([severity, count]) => (
            <div key={severity} className="flex items-center space-x-2">
              <SeverityBadge severity={severity} />
              <span className="text-sm text-gray-600">{count} tests</span>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <SeverityBadge severity={result.severity_label} />
                  <RegressionBadge isRegression={result.is_regression} />
                  <span className="text-sm text-gray-600">
                    Score: {(result.severity_score * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Cost: ${result.judge_cost?.toFixed(4) || '0.0000'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Change Type:</span>
                  <p className="text-gray-900 mt-1">{result.change_type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reasoning:</span>
                  <p className="text-gray-900 mt-1">{result.reasoning}</p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredResults.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                {severityFilter !== 'all' 
                  ? 'Try adjusting the severity filter' 
                  : 'No test results available'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TestRunDetail