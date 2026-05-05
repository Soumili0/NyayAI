import React, { useEffect, useState } from 'react';

function CriteriaPage({ criteria, saveCriteria, evaluationId }) {
  const [localCriteria, setLocalCriteria] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    setLocalCriteria(criteria || [])
  }, [criteria])

  const toggleMandatory = (id) => {
    setLocalCriteria((current) =>
      current.map((criterion) =>
        criterion.id === id
          ? { ...criterion, mandatory: !criterion.mandatory }
          : criterion
      )
    )
  }

  const updateText = (id, text) => {
    setLocalCriteria((current) =>
      current.map((criterion) =>
        criterion.id === id ? { ...criterion, text } : criterion
      )
    )
  }

  const handleSave = async () => {
    if (!saveCriteria) {
      setMessage('No evaluation loaded yet.')
      return
    }
    await saveCriteria(localCriteria)
    setMessage('Criteria saved.')
  }

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: 24, background: '#f7fafc', borderRadius: 12 }}>
      <h2>Extracted Eligibility Criteria</h2>
      {localCriteria && localCriteria.length > 0 ? (
        <>
          <p style={{ marginTop: 4, color: '#475569' }}>
            Review and tune automatically extracted criteria before final evaluation.
          </p>
          <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
            {localCriteria.map((criterion) => (
              <div key={criterion.id} style={{ padding: 16, border: '1px solid #cbd5e1', borderRadius: 10, background: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong>{criterion.id}</strong>
                  <button
                    onClick={() => toggleMandatory(criterion.id)}
                    style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 8 }}
                  >
                    {criterion.mandatory ? 'Mandatory' : 'Optional'}
                  </button>
                </div>
                <textarea
                  value={criterion.text}
                  onChange={(e) => updateText(criterion.id, e.target.value)}
                  rows={3}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, resize: 'vertical' }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            style={{ marginTop: 20, padding: '0.9rem 1.4rem', cursor: 'pointer' }}
          >
            Save Criteria
          </button>
          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </>
      ) : (
        <p style={{ marginTop: 16 }}>Upload a tender and run evaluation to see extracted eligibility criteria here.</p>
      )}
      {evaluationId && <p style={{ marginTop: 16, color: '#64748b' }}>Evaluation ID: {evaluationId}</p>}
    </div>
  );
}

export default CriteriaPage;
