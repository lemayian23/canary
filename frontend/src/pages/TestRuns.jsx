import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlayCircle, Search, Filter, Calendar, GitBranch, Hash } from 'lucide-react'
import axios from 'axios'

const TestRuns = () => {
  const [testRuns, setTestRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchTestRuns()
  }, [])

  const fetchTestRuns = async () => {
    try {
      const response = await axios.get('/api/v1/test-runs/')
      setTestRuns(response.data || [])
    } catch (error) {
      console.error('Error fetching test runs:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeTestRun = async () => {
    try {
      await axios.post('/api/v1/test-runs/execute', {}, {
        params: {
          run_name: 'Manual Test Run',
          git_commit: 'manual-' + Date.now(),
          git_branch: 'main'
        }
      })
      fetchTestRuns() // Refresh the list
    } catch (error) {
      console.error('Error executing test run:', error)
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

  const filteredRuns = testRuns.filter(run => {
    const matchesSearch = run.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Runs</h1>
          <p className="text-gray-600 mt-2">Monitor and execute test runs</p>
        </div>
        <button
          onClick={executeTestRun}
          className="btn-primary flex items-center"
        >
          <PlayCircle className="h-5 w-5 mr-2" />
          Execute Test Run
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search test runs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-32"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Test Runs List */}
      <div className="space-y-4">
        {filteredRuns.map((run) => (
          <div key={run.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{run.name}</h3>
                  <StatusBadge status={run.status} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(run.created_at)}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium text-gray-900">{run.total_tests}</span> tests
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium text-green-600">{run.passed_tests}</span> passed /{' '}
                    <span className="font-medium text-red-600">{run.failed_tests}</span> failed
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium text-gray-900">${run.total_cost?.toFixed(4) || '0.0000'}</span> cost
                  </div>
                </div>

                {(run.git_commit || run.git_branch) && (
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    {run.git_commit && (
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {run.git_commit.substring(0, 8)}
                      </div>
                    )}
                    {run.git_branch && (
                      <div className="flex items-center">
                        <GitBranch className="h-4 w-4 mr-1" />
                        {run.git_branch}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <Link
                  to={`/test-runs/${run.id}`}
                  className="btn-primary text-sm py-2 px-4"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRuns.length === 0 && (
          <div className="text-center py-12">
            <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test runs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by executing your first test run'
              }
            </p>
            <button
              onClick={executeTestRun}
              className="btn-primary"
            >
              Execute Test Run
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestRuns