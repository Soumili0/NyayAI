import { useState } from 'react';

function HistoryPage({ history, loading, onLoad, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minBidders, setMinBidders] = useState('');
  const [maxBidders, setMaxBidders] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredHistory = history.filter((item) => {
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'Eligible' && item.status_counts.Eligible > 0) ||
      (statusFilter === 'Not Eligible' &&
        item.status_counts['Not Eligible'] > 0) ||
      (statusFilter === 'Need Manual Review' &&
        item.status_counts['Need Manual Review'] > 0);

    const itemDate = new Date(item.created_at);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDate =
      (!fromDate || itemDate >= fromDate) &&
      (!toDate || itemDate <= toDate);

    const matchesBidders =
      (!minBidders || item.bidder_count >= parseInt(minBidders)) &&
      (!maxBidders || item.bidder_count <= parseInt(maxBidders));

    return matchesStatus && matchesDate && matchesBidders;
  });

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} evaluations?`
      )
    )
      return;

    for (const id of selectedIds) {
      try {
        await fetch(`https://nyayai-codeforbharat.onrender.com/evaluation/${id}`, {
          method: 'DELETE',
        });
      } catch {
        console.error(`Error deleting ${id}`);
      }
    }

    setSelectedIds([]);
    onRefresh();
  };

  const handleBulkDownload = () => {
    selectedIds.forEach((id) => {
      const link = document.createElement('a');
      link.href = `https://nyayai-codeforbharat.onrender.com/evaluation/${id}/audit/pdf`;
      link.download = `audit_${id}.pdf`;
      link.click();
    });
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '2rem auto',
        padding: 24,
        background: '#f8fafc',
        borderRadius: 16,
      }}
    >
      <h2>Saved Evaluations</h2>

      <p style={{ color: '#475569', marginTop: 4 }}>
        Review previous tender evaluations, reload older results, and compare
        past outcomes.
      </p>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            Filter by Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
            }}
          >
            <option value="">All</option>
            <option value="Eligible">Has Eligible</option>
            <option value="Not Eligible">Has Not Eligible</option>
            <option value="Need Manual Review">
              Has Need Manual Review
            </option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            From Date
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            To Date
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            Min Bidders
          </label>

          <input
            type="number"
            value={minBidders}
            onChange={(e) => setMinBidders(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              width: 80,
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.9rem',
              color: '#475569',
              marginBottom: 4,
            }}
          >
            Max Bidders
          </label>

          <input
            type="number"
            value={maxBidders}
            onChange={(e) => setMaxBidders(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              width: 80,
            }}
          />
        </div>

        <button
          onClick={() => {
            setStatusFilter('');
            setDateFrom('');
            setDateTo('');
            setMinBidders('');
            setMaxBidders('');
          }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Bulk Actions */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          padding: 16,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <input
          type="checkbox"
          checked={
            selectedIds.length === filteredHistory.length &&
            filteredHistory.length > 0
          }
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(
                filteredHistory.map((item) => item.evaluation_id)
              );
            } else {
              setSelectedIds([]);
            }
          }}
        />

        Select All ({selectedIds.length} selected)

        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1px solid #dc2626',
            background:
              selectedIds.length > 0 ? '#dc2626' : '#f3f4f6',
            color: selectedIds.length > 0 ? '#ffffff' : '#6b7280',
            cursor:
              selectedIds.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Bulk Delete
        </button>

        <button
          onClick={handleBulkDownload}
          disabled={selectedIds.length === 0}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background:
              selectedIds.length > 0 ? '#2563eb' : '#f3f4f6',
            color: selectedIds.length > 0 ? '#ffffff' : '#6b7280',
            cursor:
              selectedIds.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          Bulk Download PDFs
        </button>
      </div>

      {loading ? (
        <p>Loading evaluations...</p>
      ) : filteredHistory.length === 0 ? (
        <p>
          No saved evaluations found yet. Run an evaluation to create
          history.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
          {filteredHistory.map((item) => (
            <div
              key={item.evaluation_id}
              style={{
                padding: 20,
                borderRadius: 16,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.evaluation_id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([
                        ...selectedIds,
                        item.evaluation_id,
                      ]);
                    } else {
                      setSelectedIds(
                        selectedIds.filter(
                          (id) => id !== item.evaluation_id
                        )
                      );
                    }
                  }}
                  style={{ marginTop: 4 }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                        }}
                      >
                        Evaluation ID
                      </div>

                      <div
                        style={{
                          fontWeight: 700,
                          marginTop: 4,
                        }}
                      >
                        {item.evaluation_id}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                        }}
                      >
                        Tender
                      </div>

                      <div style={{ marginTop: 4 }}>
                        {item.tender}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                        }}
                      >
                        Date
                      </div>

                      <div style={{ marginTop: 4 }}>
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: '#475569',
                        }}
                      >
                        Bidders
                      </div>

                      <div style={{ marginTop: 4 }}>
                        {item.bidder_count}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                      marginTop: 16,
                    }}
                  >
                    {[
                      'Eligible',
                      'Not Eligible',
                      'Need Manual Review',
                    ].map((status) => (
                      <span
                        key={status}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: '#e2e8f0',
                          color: '#0f172a',
                        }}
                      >
                        {status}:{' '}
                        {item.status_counts[status] ?? 0}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    <button
                      onClick={() => onLoad(item.evaluation_id)}
                      style={{
                        padding: '0.85rem 1.3rem',
                        borderRadius: 12,
                        border: 'none',
                        background: '#2563eb',
                        color: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      Load this evaluation
                    </button>

                    <button
                      onClick={() => {
                        const link =
                          document.createElement('a');

                        link.href = `https://nyayai-codeforbharat.onrender.com/evaluation/${item.evaluation_id}/audit/pdf`;

                        link.download = `audit_${item.evaluation_id}.pdf`;

                        link.click();
                      }}
                      style={{
                        padding: '0.85rem 1.3rem',
                        borderRadius: 12,
                        border: '1px solid #2563eb',
                        background: '#ffffff',
                        color: '#2563eb',
                        cursor: 'pointer',
                      }}
                    >
                      Download Audit PDF
                    </button>

                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Are you sure you want to delete this evaluation?'
                          )
                        ) {
                          try {
                            const response = await fetch(
                              `https://nyayai-codeforbharat.onrender.com/evaluation/${item.evaluation_id}`,
                              {
                                method: 'DELETE',
                              }
                            );

                            const result =
                              await response.json();

                            if (result.success) {
                              onRefresh();
                            } else {
                              alert(
                                'Delete failed: ' + result.error
                              );
                            }
                          } catch {
                            alert('Error deleting evaluation');
                          }
                        }
                      }}
                      style={{
                        padding: '0.85rem 1.3rem',
                        borderRadius: 12,
                        border: '1px solid #dc2626',
                        background: '#ffffff',
                        color: '#dc2626',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;