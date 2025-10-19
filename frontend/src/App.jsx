import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TestCases from './pages/TestCases'
import TestRuns from './pages/TestRuns'
import TestRunDetail from './pages/TestRunDetail'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/test-cases" element={<TestCases />} />
          <Route path="/test-runs" element={<TestRuns />} />
          <Route path="/test-runs/:id" element={<TestRunDetail />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App