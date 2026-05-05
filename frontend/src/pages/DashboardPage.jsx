import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function DashboardPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('http://localhost:5000/evaluations');
      const data = await response.json();
      if (data.success) {
        setEvaluations(data.evaluations);
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>;
  }

  // Calculate statistics
  const totalEvaluations = evaluations.length;
  const statusCounts = evaluations.reduce((acc, evaluation) => {
    acc.Eligible += evaluation.status_counts.Eligible;
    acc['Not Eligible'] += evaluation.status_counts['Not Eligible'];
    acc['Need Manual Review'] += evaluation.status_counts['Need Manual Review'];
    return acc;
  }, { Eligible: 0, 'Not Eligible': 0, 'Need Manual Review': 0 });

  // Group by date (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentEvals = evaluations.filter(evaluation => new Date(evaluation.created_at) >= thirtyDaysAgo);
  const dateGroups = recentEvals.reduce((acc, evaluation) => {
    const date = new Date(evaluation.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: ['Eligible', 'Not Eligible', 'Need Manual Review'],
    datasets: [{
      data: [statusCounts.Eligible, statusCounts['Not Eligible'], statusCounts['Need Manual Review']],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
      borderColor: ['#059669', '#dc2626', '#d97706'],
      borderWidth: 1,
    }],
  };

  const barData = {
    labels: Object.keys(dateGroups).sort(),
    datasets: [{
      label: 'Evaluations per Day',
      data: Object.keys(dateGroups).sort().map(date => dateGroups[date]),
      backgroundColor: '#3b82f6',
    }],
  };

  return (
    <div style={{ maxWidth: 1000, margin: '2rem auto', padding: 24, background: '#f8fafc', borderRadius: 16 }}>
      <h2>Evaluation Dashboard</h2>
      <p style={{ color: '#475569', marginTop: 4 }}>
        Overview of tender evaluation statistics and trends.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h3>Total Evaluations</h3>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#2563eb' }}>{totalEvaluations}</div>
        </div>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h3>Total Bidders Evaluated</h3>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981' }}>
            {statusCounts.Eligible + statusCounts['Not Eligible'] + statusCounts['Need Manual Review']}
          </div>
        </div>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3>Generate Summary Report</h3>
          <button 
            onClick={() => {
              const link = document.createElement('a');
              link.href = 'http://localhost:5000/summary/pdf';
              link.download = 'evaluation_summary.pdf';
              link.click();
            }}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: '#2563eb', color: '#ffffff', cursor: 'pointer', marginTop: 8 }}
          >
            Download PDF Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginTop: 24 }}>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h3>Bidder Status Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <h3>Evaluations Over Last 30 Days</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;