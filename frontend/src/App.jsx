import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import DocumentUpload from './components/DocumentUpload'
import CriteriaPage from './pages/CriteriaPage'
import ResultsPage from './pages/ResultsPage'
import ReviewPage from './pages/ReviewPage'
import ExportPage from './pages/ExportPage'
import HistoryPage from './pages/HistoryPage'
import AuditLogPage from './pages/AuditLogPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [page, setPage] = useState('upload')
  const [tenderFilename, setTenderFilename] = useState('')
  const [bidderFilenames, setBidderFilenames] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluationId, setEvaluationId] = useState('')
  const [evaluationHistory, setEvaluationHistory] = useState([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState('')

  const apiBase = 'https://nyayai-codeforbharat.onrender.com'

  const fetchHistory = async () => {
    setIsHistoryLoading(true)
    try {
      const response = await fetch(`${apiBase}/evaluations`)
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Unable to fetch history')
      }
      setEvaluationHistory(result.evaluations)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (page === 'history') {
      fetchHistory()
    }
  }, [page])

  const uploadTender = async (file) => {
    setError('')
    setEvaluation(null)
    setStatusMessage('Uploading tender document...')
    setIsBusy(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${apiBase}/upload/tender`, {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      setTenderFilename(result.filename)
      setStatusMessage(`Tender uploaded: ${result.filename}`)
    } catch (err) {
      setError(err.message)
      setStatusMessage('Tender upload failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const uploadBidders = async (files) => {
    setError('')
    setEvaluation(null)
    setStatusMessage('Uploading bidder documents...')
    setIsBusy(true)

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    try {
      const response = await fetch(`${apiBase}/upload/bidders`, {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }
      setBidderFilenames(result.filenames)
      setStatusMessage(`Uploaded ${result.filenames.length} bidder documents.`)
    } catch (err) {
      setError(err.message)
      setStatusMessage('Bidder upload failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const runEvaluation = async () => {
    if (!tenderFilename || bidderFilenames.length === 0) {
      setError('Please upload a tender and bidder files first.')
      return
    }

    setError('')
    setStatusMessage('Running evaluation...')
    setIsBusy(true)

    try {
      const response = await fetch(`${apiBase}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tender: tenderFilename, bidders: bidderFilenames })
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Evaluation failed')
      }
      setEvaluation(result.evaluation)
      setEvaluationId(result.evaluation_id)
      setStatusMessage('Evaluation completed successfully.')
      setPage('results')
    } catch (err) {
      setError(err.message)
      setStatusMessage('Evaluation failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const saveCriteria = async (criteria) => {
    if (!evaluationId) {
      setError('No active evaluation to update criteria for.')
      return
    }
    setError('')
    setStatusMessage('Saving criteria...')
    setIsBusy(true)

    try {
      const response = await fetch(`${apiBase}/evaluation/${evaluationId}/criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criteria })
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Criteria save failed')
      }
      setEvaluation(result.evaluation)
      setStatusMessage('Criteria updated successfully.')
    } catch (err) {
      setError(err.message)
      setStatusMessage('Criteria save failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const resolveReview = async (bidderName, criterionId, decision) => {
    if (!evaluationId) {
      setError('No active evaluation selected for review.')
      return
    }
    setError('')
    setStatusMessage('Saving review decision...')
    setIsBusy(true)

    try {
      const response = await fetch(`${apiBase}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluation_id: evaluationId, bidder: bidderName, criterion_id: criterionId, decision })
      })
      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Review update failed')
      }
      setEvaluation(result.evaluation)
      setStatusMessage(`Manual review saved for ${bidderName}`)
    } catch (err) {
      setError(err.message)
      setStatusMessage('Review update failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage />
      case 'upload':
        return (
          <>
            <DocumentUpload onTenderUpload={uploadTender} onBiddersUpload={uploadBidders} />
            <div style={{ maxWidth: 700, margin: '1rem auto', padding: 20 }}>
              <button
                onClick={runEvaluation}
                disabled={isBusy || !tenderFilename || bidderFilenames.length === 0}
                style={{ padding: '0.8rem 1.2rem', fontSize: 16, cursor: isBusy ? 'not-allowed' : 'pointer' }}
              >
                Run Evaluation
              </button>
              {statusMessage && <p style={{ marginTop: 16 }}>{statusMessage}</p>}
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {tenderFilename && (
                <div style={{ marginTop: 12 }}>
                  <strong>Tender file:</strong> {tenderFilename}
                </div>
              )}
              {bidderFilenames.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Bidder files:</strong> {bidderFilenames.join(', ')}
                </div>
              )}
            </div>
          </>
        )
      case 'criteria':
        return <CriteriaPage criteria={evaluation?.criteria ?? []} saveCriteria={saveCriteria} evaluationId={evaluationId} />
      case 'results':
        return <ResultsPage evaluation={evaluation} />
      case 'review':
        return <ReviewPage evaluation={evaluation} onResolve={resolveReview} />
      case 'export':
        return <ExportPage evaluation={evaluation} />
      case 'history':
        return (
          <HistoryPage
            history={evaluationHistory}
            loading={isHistoryLoading}
            onLoad={(id) => {
              setPage('results')
              setStatusMessage('Loading selected evaluation...')
              setIsBusy(true)
              fetch(`${apiBase}/evaluation/${id}`)
                .then((res) => res.json())
                .then((result) => {
                  if (!result.success) {
                    throw new Error(result.error || 'Loading failed')
                  }
                  setEvaluation(result.evaluation)
                  setEvaluationId(result.evaluation.evaluation_id)
                  setStatusMessage('Evaluation loaded.')
                })
                .catch((err) => {
                  setError(err.message)
                })
                .finally(() => {
                  setIsBusy(false)
                })
            }}
            onRefresh={fetchHistory}
          />
        )
      case 'audit':
        return <AuditLogPage />
      default:
        return null
    }
  }

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 40 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 18px' }}>
        <header style={{ padding: '2rem 0 1rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2.4rem', color: '#0f172a' }}>NyayAI</h1>
          <p style={{ marginTop: 12, color: '#475569', maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
           AI-powered system for automated tender analysis, document processing, and explainable decision-making
          </p>
        </header>

        <Navbar currentPage={page} setPage={setPage} />

        {evaluation && (
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
            <div style={{ padding: 18, borderRadius: 16, background: '#ffffff', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginBottom: 8 }}>EVALUATION</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{evaluation.evaluation_id.slice(0, 8)}</div>
              <div style={{ marginTop: 8, color: '#475569' }}>Evaluation ID</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: '#ffffff', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>BIDDERS</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{evaluation.evaluations.length}</div>
              <div style={{ marginTop: 8, color: '#475569' }}>Bidder submissions processed</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: '#ffffff', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>LAST UPDATED</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{evaluation.last_reviewed ? 'Reviewed' : 'Fresh'}</div>
              <div style={{ marginTop: 8, color: '#475569' }}>{evaluation.last_reviewed || evaluation.created_at}</div>
            </div>
          </div>
        )}

        {renderPage()}
      </div>
    </div>
  )
}

export default App
