import React from 'react';

function Navbar({ currentPage, setPage }) {
  const buttonStyle = (active) => ({
    padding: '0.8rem 1rem',
    borderRadius: 8,
    border: active ? '2px solid #2563eb' : '1px solid #cbd5e1',
    background: active ? '#e0f2fe' : '#ffffff',
    cursor: 'pointer'
  })

  return (
    <nav style={{ display: 'flex', gap: 14, justifyContent: 'center', margin: '2rem 0', flexWrap: 'wrap' }}>
      <button style={buttonStyle(currentPage === 'dashboard')} onClick={() => setPage('dashboard')}>Dashboard</button>
      <button style={buttonStyle(currentPage === 'upload')} onClick={() => setPage('upload')}>Upload</button>
      <button style={buttonStyle(currentPage === 'criteria')} onClick={() => setPage('criteria')}>Criteria</button>
      <button style={buttonStyle(currentPage === 'results')} onClick={() => setPage('results')}>Results</button>
      <button style={buttonStyle(currentPage === 'review')} onClick={() => setPage('review')}>Manual Review</button>
      <button style={buttonStyle(currentPage === 'history')} onClick={() => setPage('history')}>History</button>
      <button style={buttonStyle(currentPage === 'audit')} onClick={() => setPage('audit')}>Audit Log</button>
      <button style={buttonStyle(currentPage === 'export')} onClick={() => setPage('export')}>Export</button>
    </nav>
  );
}

export default Navbar;
