import React from 'react'

function EvaluationResults({ evaluation }) {
  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: 20, border: '1px solid #d1d5db', borderRadius: 12, backgroundColor: '#f9fafb' }}>
      <h2>Evaluation Summary</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>Tender:</strong> {evaluation.tender}
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Criteria extracted:</strong>
        <ul>
          {evaluation.criteria.map((criterion) => (
            <li key={criterion.id}>
              <strong>{criterion.id}</strong>: {criterion.text} {criterion.mandatory ? '(Mandatory)' : '(Optional)'}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <strong>Bidder evaluations:</strong>
        {evaluation.evaluations.map((item) => (
          <div key={item.bidder} style={{ marginTop: 16, padding: 16, border: '1px solid #d1d5db', borderRadius: 10, backgroundColor: '#ffffff' }}>
            <h3 style={{ marginBottom: 8 }}>{item.bidder}</h3>
            <p><strong>Status:</strong> {item.status}</p>
            <div>
              <strong>Criterion details:</strong>
              <ul>
                {item.details.map((detail, index) => (
                  <li key={`${item.bidder}-${index}`} style={{ marginBottom: 8 }}>
                    <div><strong>{detail.criterion}</strong> — {detail.result}</div>
                    <div>Evidence: {detail.evidence}</div>
                    <div>Document: {detail.document}</div>
                    {detail.explanation && (
                      <div style={{ color: '#2563eb', marginTop: 4 }}><em>Explanation: {detail.explanation}</em></div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EvaluationResults
