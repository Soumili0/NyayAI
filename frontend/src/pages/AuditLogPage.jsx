import React, { useEffect, useState } from 'react';

function AuditLogPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [error, setError] = useState('');
  const apiBase = 'https://your-backend-name.onrender.com';
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}/evaluations`);
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Unable to fetch history');
        }
        setEvaluations(result.evaluations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const loadEvaluation = async (evaluationId) => {
    setLoadingEvaluation(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/evaluation/${evaluationId}`);
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Unable to load evaluation');
      }
      setSelectedEvaluation(result.evaluation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '2rem auto', padding: 24, background: '#f8fafc', borderRadius: 16 }}>
      <h2>Digital Audit Log</h2>
      <p style={{ color: '#475569', marginTop: 4 }}>
        View the full action history for evaluations, including AI vs user actions and extraction metadata.
      </p>

      {loading ? (
        <p>Loading available evaluations...</p>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 600 }}>Select Evaluation:</label>
            <select
              value={selectedEvaluation?.evaluation_id || ''}
              onChange={(e) => loadEvaluation(e.target.value)}
              style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #cbd5e1', minWidth: 280 }}
            >
              <option value="">Choose evaluation</option>
              {evaluations.map((item) => (
                <option key={item.evaluation_id} value={item.evaluation_id}>
                  {item.evaluation_id.slice(0, 8)} — {item.tender} — {new Date(item.created_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            {selectedEvaluation && (
              <div style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                Audit entries: {selectedEvaluation.audit?.length ?? 0}
              </div>
            )}
          </div>

          {loadingEvaluation && <p>Loading selected audit log...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {selectedEvaluation ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 20, background: '#ffffff', borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <h3 style={{ marginTop: 0 }}>Evaluation Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div><strong>ID:</strong> {selectedEvaluation.evaluation_id}</div>
                  <div><strong>Tender:</strong> {selectedEvaluation.tender}</div>
                  <div><strong>Created:</strong> {new Date(selectedEvaluation.created_at).toLocaleString()}</div>
                  <div><strong>System Metadata:</strong> {selectedEvaluation.system_metadata?.engine} v{selectedEvaluation.system_metadata?.version}</div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', background: '#ffffff', borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Timestamp</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Action</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Actor</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Metadata</th>
                      <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEvaluation.audit?.map((entry, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 12 }}>{new Date(entry.time).toLocaleString()}</td>
                        <td style={{ padding: 12 }}>{entry.action}</td>
                        <td style={{ padding: 12 }}>{entry.actor || 'System'}</td>
                        <td style={{ padding: 12, color: '#475569' }}>{entry.metadata ? JSON.stringify(entry.metadata) : '—'}</td>
                        <td style={{ padding: 12, color: '#475569' }}>{entry.details ? JSON.stringify(entry.details) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, background: '#ffffff', borderRadius: 12, border: '1px solid #cbd5e1' }}>
              <p>Select an evaluation to view its full digital audit log.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AuditLogPage;
