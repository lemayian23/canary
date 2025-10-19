import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Search } from 'lucide-react'
import axios from 'axios'

const TestCases = () => {
  const [testCases, setTestCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCase, setEditingCase] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    input_prompt: '',
    expected_behavior: '',
    category: 'factual',
    is_active: true
  })

  useEffect(() => {
    fetchTestCases()
  }, [])

  const fetchTestCases = async () => {
    try {
      const response = await axios.get('/api/v1/test-cases/')
      setTestCases(response.data.test_cases || [])
    } catch (error) {
      console.error('Error fetching test cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCase) {
        await axios.put(`/api/v1/test-cases/${editingCase.id}`, formData)
      } else {
        await axios.post('/api/v1/test-cases/', formData)
      }
      setShowModal(false)
      setEditingCase(null)
      setFormData({
        name: '',
        description: '',
        input_prompt: '',
        expected_behavior: '',
        category: 'factual',
        is_active: true
      })
      fetchTestCases()
    } catch (error) {
      console.error('Error saving test case:', error)
    }
  }

  const handleEdit = (testCase) => {
    setEditingCase(testCase)
    setFormData({
      name: testCase.name,
      description: testCase.description,
      input_prompt: testCase.input_prompt,
      expected_behavior: testCase.expected_behavior,
      category: testCase.category,
      is_active: testCase.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        // Note: We'll need to add a DELETE endpoint in the backend
        console.log('Delete test case:', id)
        // await axios.delete(`/api/v1/test-cases/${id}`)
        // fetchTestCases()
      } catch (error) {
        console.error('Error deleting test case:', error)
      }
    }
  }

  const filteredCases = testCases.filter(testCase =>
    testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
          <p className="text-gray-600 mt-2">Manage your golden dataset of test cases</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Test Case
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.map((testCase) => (
          <div key={testCase.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{testCase.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    testCase.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {testCase.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {testCase.category}
                  </span>
                </div>
                {testCase.description && (
                  <p className="text-gray-600 mt-1">{testCase.description}</p>
                )}
                <div className="mt-3 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Input Prompt:</span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                      {testCase.input_prompt}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Expected Behavior:</span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                      {testCase.expected_behavior}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(testCase)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(testCase.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No test cases found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first test case'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add Test Case
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingCase ? 'Edit Test Case' : 'Add Test Case'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., factual_accuracy_test"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Describe what this test case validates..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Input Prompt *
                  </label>
                  <textarea
                    required
                    value={formData.input_prompt}
                    onChange={(e) => setFormData({ ...formData, input_prompt: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="The prompt that will be sent to the LLM..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Behavior *
                  </label>
                  <textarea
                    required
                    value={formData.expected_behavior}
                    onChange={(e) => setFormData({ ...formData, expected_behavior: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Describe the expected output behavior..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="factual">Factual</option>
                      <option value="creative">Creative</option>
                      <option value="safety">Safety</option>
                      <option value="format">Format</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="input-field"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCase(null)
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCase ? 'Update' : 'Create'} Test Case
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestCases