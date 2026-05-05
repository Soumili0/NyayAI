import React from 'react';

function ExportPage({ evaluation }) {
  const downloadJson = () => {
    if (!evaluation) return
    const blob = new Blob([JSON.stringify(evaluation, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'evaluation-report.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadCsv = () => {
    if (!evaluation) return
    const rows = ['Bidder,Criterion,Result,Evidence,Document,OverallStatus']
    evaluation.evaluations.forEach((item) => {
      item.details.forEach((detail) => {
        rows.push(`"${item.bidder}","${detail.criterion}","${detail.result}","${detail.evidence}","${detail.document}","${item.status}"`)
      })
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'evaluation-report.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: 24, background: '#ffffff', borderRadius: 16, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)' }}>
      <h2>Export Evaluation Report</h2>
      {evaluation ? (
        <>
          <p style={{ color: '#475569' }}>Download the current evaluation results and audit-ready summary for record keeping or submission.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
            <button onClick={downloadJson} style={{ padding: '0.9rem 1.4rem', borderRadius: 12, border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer' }}>
              Download JSON
            </button>
            <button onClick={downloadCsv} style={{ padding: '0.9rem 1.4rem', borderRadius: 12, border: 'none', background: '#0f766e', color: 'white', cursor: 'pointer' }}>
              Download CSV
            </button>
          </div>
          <div style={{ marginTop: 20, color: '#475569' }}>
            <div><strong>Evaluation ID:</strong> {evaluation.evaluation_id}</div>
            <div><strong>Total bidders:</strong> {evaluation.evaluations.length}</div>
            <div><strong>Criteria count:</strong> {evaluation.criteria.length}</div>
          </div>
        </>
      ) : (
        <p style={{ color: '#475569' }}>Run the evaluation first to export the report.</p>
      )}
    </div>
  )
}

export default ExportPage;
