import React, { useState } from 'react';

function ResultsPage({ evaluation }) {
  const [evidenceModal, setEvidenceModal] = useState({ show: false, bidder: null, detail: null });

  const openEvidenceModal = (bidder, detail) => {
    setEvidenceModal({ show: true, bidder, detail });
  };

  const closeEvidenceModal = () => {
    setEvidenceModal({ show: false, bidder: null, detail: null });
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index} style={{ backgroundColor: '#fef3c7', padding: '2px 4px', borderRadius: '3px' }}>{part}</mark> : part
    );
  };

  if (!evaluation) {
    return (
      <div style={{ maxWidth: 700, margin: '2rem auto' }}>
        <h2>Bidder Evaluation Results</h2>
        <p>Run the evaluation first to see results here.</p>
      </div>
    )
  }

  const totals = evaluation.evaluations.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    },
    { Eligible: 0, 'Not Eligible': 0, 'Need Manual Review': 0 }
  )

  return (
    <div style={{ maxWidth: 860, margin: '2rem auto', padding: 24, background: '#ffffff', borderRadius: 12 }}>
      <h2>Bidder Evaluation Results</h2>
      <p style={{ color: '#64748b' }}>Evaluation ID: {evaluation.evaluation_id}</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {['Eligible', 'Not Eligible', 'Need Manual Review'].map((status) => (
          <div
            key={status}
            style={{
              flex: 1,
              minWidth: 180,
              padding: 16,
              borderRadius: 12,
              background: status === 'Eligible' ? '#ecfdf5' : status === 'Not Eligible' ? '#fef3f2' : '#fef9c3',
              border: '1px solid #e2e8f0'
            }}
          >
            <strong>{status}</strong>
            <div style={{ fontSize: 24, marginTop: 8 }}>{totals[status] || 0}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Bidder</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Document Type</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Status</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Score</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Evidence Count</th>
              <th style={{ textAlign: 'left', padding: 12, borderBottom: '2px solid #e2e8f0' }}>Blacklist</th>
            </tr>
          </thead>
          <tbody>
            {evaluation.evaluations.map((item) => (
              <tr key={item.bidder} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>{item.bidder}</td>
                <td style={{ padding: 12 }}>{item.document_type}</td>
                <td style={{ padding: 12 }}>{item.status}</td>
                <td style={{ padding: 12 }}>{item.score}</td>
                <td style={{ padding: 12 }}>{item.details.length}</td>
                <td style={{ padding: 12 }}>
                  {item.blacklist_flag ? (
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>RED FLAG</span>
                  ) : (
                    <span style={{ color: '#16a34a' }}>Clear</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ marginBottom: 14 }}>Detailed bidder evidence</h3>
        {evaluation.evaluations.map((item) => (
          <div key={item.bidder} style={{ marginBottom: 20, padding: 16, border: '1px solid #e2e8f0', borderRadius: 10 }}>
            <h3 style={{ margin: '0 0 10px' }}>{item.bidder}</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <div><strong>Document Type:</strong> {item.document_type}</div>
              <div><strong>Overall status:</strong> {item.status}</div>
              {item.blacklist_flag && (
                <div style={{ color: '#dc2626', fontWeight: 700 }}>BLACKLIST ALERT</div>
              )}
            </div>
            <div>
              <strong>Criterion details</strong>
              <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                {item.details.map((detail, index) => (
                  <li key={index} style={{ marginBottom: 10 }}>
                    <div><strong>{detail.criterion}</strong> — {detail.result}</div>
                    <div>Evidence: {detail.evidence}</div>
                    <div>Document: {detail.document}</div>
                    <div>Confidence: {detail.confidence ?? 0}%</div>
                    <div>Source: {detail.source_type}</div>
                    <button 
                      onClick={() => openEvidenceModal(item, detail)}
                      style={{ marginTop: 8, padding: '6px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#ffffff', color: '#2563eb', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      View Evidence Details
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {evaluation.audit && evaluation.audit.length > 0 && (
        <div style={{ marginTop: 28, padding: 16, border: '1px solid #cbd5e1', borderRadius: 10, background: '#f8fafc' }}>
          <h3>Audit trail</h3>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            {evaluation.audit.map((entry, index) => (
              <li key={index} style={{ marginBottom: 8 }}>
                <strong>{entry.action}</strong> at {entry.time}
                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div style={{ color: '#475569' }}>{JSON.stringify(entry.details)}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Evidence Modal */}
      {evidenceModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 12,
            width: '90%',
            maxWidth: 1200,
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: 20,
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Evidence Analysis: {evidenceModal.bidder?.bidder}</h3>
              <button 
                onClick={closeEvidenceModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Panel - Tender Criteria & Document */}
              <div style={{
                flex: 1,
                padding: 20,
                borderRight: '1px solid #e2e8f0',
                background: '#f8fafc',
                overflowY: 'auto'
              }}>
                <h4 style={{ color: '#1e293b', marginTop: 0 }}>Tender Requirement</h4>
                <div style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  marginBottom: 16
                }}>
                  <strong>{evidenceModal.detail?.criterion}</strong>
                  <div style={{ marginTop: 8, color: '#475569' }}>
                    Status: <span style={{
                      color: evidenceModal.detail?.result === 'Pass' ? '#10b981' : 
                             evidenceModal.detail?.result === 'Fail' ? '#ef4444' : '#f59e0b'
                    }}>
                      {evidenceModal.detail?.result}
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Evidence Found:</strong> {evidenceModal.detail?.evidence}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Confidence:</strong> {evidenceModal.detail?.confidence ?? 0}%
                  </div>
                </div>
                
                <h4 style={{ color: '#1e293b' }}>Tender Document Context</h4>
                <div style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {highlightText(
                    evaluation?.tender_preview || 'Tender document preview not available',
                    evidenceModal.detail?.criterion
                  )}
                </div>
              </div>
              
              {/* Right Panel - Bidder Document */}
              <div style={{
                flex: 1,
                padding: 20,
                overflowY: 'auto'
              }}>
                <h4 style={{ color: '#1e293b', marginTop: 0 }}>Bidder Document Analysis</h4>
                <div style={{
                  padding: 16,
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  {highlightText(
                    evidenceModal.bidder?.full_document_text || evidenceModal.bidder?.document_preview || 'Document text not available',
                    evidenceModal.detail?.evidence
                  )}
                </div>
                <div style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 6 }}>
                  <strong>💡 AI Analysis:</strong> The system searched for evidence of "{evidenceModal.detail?.evidence}" 
                  in the bidder's document. Yellow highlights show where matching content was found.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultsPage;
