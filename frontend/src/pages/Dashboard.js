import React, { useState, useEffect } from "react";
import Chatbot from "./Chatbot";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [charts, setCharts] = useState([]);
  const [folder, setFolder] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [enlargedChart, setEnlargedChart] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const savedCharts = sessionStorage.getItem("charts");
    const savedFolder = sessionStorage.getItem("folder");
    const savedSummaries = sessionStorage.getItem("summaries");
    const savedTitles = sessionStorage.getItem("titles");
    const savedMetrics = sessionStorage.getItem("metrics");

    if (savedCharts && savedFolder && savedSummaries && savedTitles) {
      setCharts(JSON.parse(savedCharts));
      setFolder(savedFolder);
      setSummaries(JSON.parse(savedSummaries));
      setTitles(JSON.parse(savedTitles));
      setAnalyzed(true);
      if (savedMetrics) {
        setMetrics(JSON.parse(savedMetrics));
      }
    }
  }, []);

const fetchCharts = () => {
  setLoading(true);

  // First: Fetch CSV export message
  fetch("http://localhost:8083/devices/export/csv")
    .then((res) => {
      if (!res.ok) {
        throw new Error("CSV export failed");
      }
      return res.text(); // since it returns a plain string
    })
    .then((csvMessage) => {
      console.log("CSV Export:", csvMessage);

      // Then: Fetch chart analysis
      return fetch("http://localhost:5000/analyze");
    })
    .then((res) => res.json())
    .then((data) => {
      const chartsData = Array.isArray(data.charts) ? data.charts : [];
      const folderData = data.folder || "";
      const summariesData = Array.isArray(data.summaries) ? data.summaries : [];
      const titlesData = Array.isArray(data.titles) ? data.titles : [];
      const metricsData = data.metrics || null;

      setCharts(chartsData);
      setFolder(folderData);
      setSummaries(summariesData);
      setTitles(titlesData);
      setMetrics(metricsData);
      setAnalyzed(true);

      sessionStorage.setItem("charts", JSON.stringify(chartsData));
      sessionStorage.setItem("folder", folderData);
      sessionStorage.setItem("summaries", JSON.stringify(summariesData));
      sessionStorage.setItem("titles", JSON.stringify(titlesData));
      sessionStorage.setItem("metrics", JSON.stringify(metricsData));

      setLoading(false);
    })
    .catch((error) => {
      console.error("Error during analysis:", error);
      setLoading(false);
    });
};

  return (
    <div className="dashboard-container">
      <div className="analyze-button-container">
        <button
          onClick={fetchCharts}
          disabled={loading}
          className="analyze-button"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {metrics && (
        <div className="metrics-container">
          <div className="metric-box blue">
            <div className="metric-value">{metrics.total_devices}</div>
            <div className="metric-label">Total Devices</div>
          </div>
          <div className="metric-box green">
            <div className="metric-value">{metrics.total_active}</div>
            <div className="metric-label">Active Devices</div>
          </div>
          <div className="metric-box orange">
            <div className="metric-value">{metrics.total_inactive}</div>
            <div className="metric-label">Inactive Devices</div>
          </div>
          <div className="metric-box purple">
            <div className="metric-value">{metrics.total_users}</div>
            <div className="metric-label">Total Users</div>
          </div>
        </div>
      )}

      {analyzed && charts.length > 0 ? (
        <div className="charts-grid">
          {charts.map((chart, index) => (
            <div
              key={index}
              className="chart-card"
              onClick={() => setEnlargedChart(index)}
              title={summaries[index] || "Click to enlarge"}
            >
              <img
                src={`http://localhost:5000/charts/${folder}/${chart}`}
                alt={`Chart ${index + 1}`}
                className="chart-image"
              />
              <p className="chart-title">{titles[index] || `Chart ${index + 1}`}</p>
              {summaries[index] && (
                <p className="chart-summary">{summaries[index]}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        !loading && <p className="no-charts-message">Click Analyze to generate charts.</p>
      )}

      {enlargedChart !== null && (
        <div className="enlarged-chart-overlay" onClick={() => setEnlargedChart(null)}>
          <div className="enlarged-chart-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setEnlargedChart(null)}>×</button>
            <div className="enlarged-chart-content">
              <iframe
                src={`http://localhost:5000/charts/${folder}/${charts[enlargedChart].replace('.png', '.html')}`}
                title="Enlarged Chart"
                className="enlarged-chart-iframe"
              />
              <div className="enlarged-chart-summary">
                <h3 className="summary-title">{titles[enlargedChart] || `Chart ${enlargedChart + 1}`}</h3>
                {summaries[enlargedChart] && (
                  <div className="summary-text">
                    {summaries[enlargedChart].split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default Dashboard;
