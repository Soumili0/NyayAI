import React from 'react';

function ReviewPage({ evaluation, onResolve }) {
  if (!evaluation) {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto' }}>
        <h2>Manual Review & Override</h2>
        <p>Run evaluation first to surface ambiguous cases for review.</p>
      </div>
    )
  }

  const reviewItems = evaluation.evaluations.flatMap((item) =>
    item.details
      .map((detail, index) => ({ bidder: item.bidder, detail, index }))
      .filter((entry) => entry.detail.result === 'Review' || entry.detail.result === 'Need Manual Review')
  )

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: 24, background: '#f7fafc', borderRadius: 16 }}>
      <h2>Manual Review & Override</h2>
      <p style={{ color: '#475569', marginTop: 4 }}>
        Review all flagged eligibility checks and decide whether the bidder should be approved or disqualified for the specific criterion.
      </p>
      {reviewItems.length > 0 ? (
        reviewItems.map((item) => (
          <div key={`${item.bidder}-${item.index}`} style={{ marginBottom: 18, padding: 20, border: '1px solid #cbd5e1', borderRadius: 16, background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 10px' }}>{item.bidder}</h3>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>{item.detail.criterion}</div>
                <div style={{ color: '#334155' }}>{item.detail.evidence}</div>
                {item.detail.explanation && (
                  <div style={{ color: '#2563eb', marginTop: 4 }}><em>Explanation: {item.detail.explanation}</em></div>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ padding: '6px 12px', borderRadius: 999, background: '#fef3c7', color: '#92400e' }}>
                  Confidence: {item.detail.confidence ?? 'N/A'}%
                </span>
                <span style={{ padding: '6px 12px', borderRadius: 999, background: '#dbeafe', color: '#1d4ed8' }}>
                  Source: {item.detail.source_type || 'unknown'}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onResolve(item.bidder, item.detail.criterion_id, 'pass')} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer' }}>
                Override: Mark as Pass
              </button>
              <button onClick={() => onResolve(item.bidder, item.detail.criterion_id, 'fail')} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer' }}>
                Override: Mark as Fail
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#475569' }}>No ambiguous cases found. Evaluation is clear for all bidders.</p>
      )}
    </div>
  )
}

export default ReviewPage;
