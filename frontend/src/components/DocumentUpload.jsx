import React, { useState } from 'react';

function DocumentUpload({ onTenderUpload, onBiddersUpload }) {
  const [tenderFile, setTenderFile] = useState(null);
  const [bidderFiles, setBidderFiles] = useState([]);

  const handleTenderChange = (e) => {
    setTenderFile(e.target.files[0]);
  };

  const handleBiddersChange = (e) => {
    setBidderFiles(Array.from(e.target.files));
  };

  const handleTenderUpload = () => {
    if (tenderFile && onTenderUpload) {
      onTenderUpload(tenderFile);
    }
  };

  const handleBiddersUpload = () => {
    if (bidderFiles.length > 0 && onBiddersUpload) {
      onBiddersUpload(bidderFiles);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: 24, border: '1px solid #cbd5e1', borderRadius: 16, backgroundColor: '#ffffff', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)' }}>
      <h2>Upload Tender & Bidder Documents</h2>
      <p style={{ color: '#475569', marginBottom: 20 }}>
        Select the tender file and all bidder submissions. The backend then stores them for evaluation.
      </p>
      <div style={{ display: 'grid', gap: 18 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Tender Document</label>
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={handleTenderChange} />
          <button
            onClick={handleTenderUpload}
            disabled={!tenderFile}
            style={{ width: 180, padding: '0.8rem 1rem', borderRadius: 10, border: 'none', backgroundColor: tenderFile ? '#2563eb' : '#94a3b8', color: 'white', cursor: tenderFile ? 'pointer' : 'not-allowed' }}
          >
            Upload Tender
          </button>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ fontWeight: 600 }}>Bidder Documents</label>
          <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple onChange={handleBiddersChange} />
          <button
            onClick={handleBiddersUpload}
            disabled={bidderFiles.length === 0}
            style={{ width: 180, padding: '0.8rem 1rem', borderRadius: 10, border: 'none', backgroundColor: bidderFiles.length > 0 ? '#16a34a' : '#94a3b8', color: 'white', cursor: bidderFiles.length > 0 ? 'pointer' : 'not-allowed' }}
          >
            Upload Bidders
          </button>
        </div>
      </div>
      <div style={{ marginTop: 20, color: '#334155' }}>
        {tenderFile && <div>Selected Tender: <strong>{tenderFile.name}</strong></div>}
        {bidderFiles.length > 0 && <div>Selected Bidder files: <strong>{bidderFiles.map(f => f.name).join(', ')}</strong></div>}
      </div>
    </div>
  );
}

export default DocumentUpload;
