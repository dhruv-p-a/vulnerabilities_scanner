import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, History, Download, AlertTriangle, CheckCircle2, XCircle, Cpu, ExternalLink, Activity, Info, Menu } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { initiateScan, pollScanResult } from './services/api';
import { getRemediation } from './utils/remediation';
import jsPDF from 'jspdf';

// --- Reusable Components ---

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const Badge = ({ children, color }) => (
  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color}`}>
    {children}
  </span>
);

// --- Main App ---

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('history') || '[]'));
  const [error, setError] = useState('');

  const handleScan = async (targetUrl = url) => {
    if (!targetUrl) return setError('Please provide a target URL');
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const scanId = await initiateScan(targetUrl);
      const data = await pollScanResult(scanId);

      const newResult = { ...data, url: targetUrl, timestamp: new Date().toLocaleString() };
      setResult(newResult);

      const updatedHistory = [newResult, ...history.filter(h => h.url !== targetUrl)].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('history', JSON.stringify(updatedHistory));
    } catch (err) {
      setError('Connection failed. Ensure the scanner backend is online.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#6366f1';
    if (score >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(3, 7, 18);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("VULNSCAN LITE REPORT", 20, 30);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Target Audit: ${result.url}`, 20, 45);
    doc.text(`Generated: ${result.timestamp}`, 20, 52);

    let y = 70;
    Object.entries(result.headers).forEach(([h, s]) => {
      const isMissing = s === 'Missing';
      doc.setTextColor(isMissing ? 244 : 16, isMissing ? 63 : 185, isMissing ? 94 : 129);
      doc.text(`${h}: ${s}`, 20, y);
      y += 8;
      if (isMissing) {
        doc.setTextColor(150, 150, 150);
        doc.text(`Fix: ${getRemediation(h)}`, 25, y);
        y += 12;
      }
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`Audit_${result.url.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-cyber-dark/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white">VULNSCAN <span className="text-indigo-500">LITE</span></h1>
              <Badge color="text-indigo-400 border-indigo-400/20 bg-indigo-400/5">v1.0 Pro</Badge>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="hover:text-white transition-colors">History</a>
            <a href="#" className="hover:text-white transition-colors">Settings</a>
          </div>
          <button className="md:hidden text-slate-400"><Menu /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero & Search */}
        <section className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Securing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Modern Web.</span>
          </motion.h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Professional-grade security header analysis and remediation for developers.
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex flex-col md:flex-row gap-3 bg-cyber-card border border-white/10 p-3 rounded-3xl">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter target URL (e.g., https://github.com)"
                  className="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-slate-600"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button
                onClick={() => handleScan()}
                disabled={loading}
                className="cyber-button px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Initializing Scan...' : 'Start Audit'}
              </button>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-cyber-dark/80 backdrop-blur-2xl flex flex-col items-center justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 border-2 border-indigo-500/20 rounded-full"></div>
                <div className="w-24 h-24 border-t-2 border-indigo-500 rounded-full animate-spin absolute top-0"></div>
                <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-8 h-8 animate-pulse" />
              </div>
              <p className="mt-8 text-indigo-400 font-black tracking-widest uppercase text-sm animate-pulse">Running Passive Security Audit...</p>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mb-12">
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-4 text-rose-400">
                <AlertTriangle />
                <span className="font-medium">{error}</span>
                <button onClick={() => handleScan()} className="ml-auto font-black text-xs hover:underline uppercase">Retry</button>
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Dashboard Layout */}
              <div className="grid lg:grid-cols-4 gap-6">
                <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Security Integrity</p>
                  <div className="relative w-40 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[{ value: result.score }, { value: 100 - result.score }]} innerRadius={55} outerRadius={70} startAngle={90} endAngle={450} paddingAngle={0} dataKey="value">
                          <Cell fill={getScoreColor(result.score)} />
                          <Cell fill="rgba(255,255,255,0.05)" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{result.score}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Score</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Badge color={result.score >= 70 ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" : "text-rose-400 border-rose-400/20 bg-rose-400/5"}>
                      Grade {result.score >= 90 ? 'A' : result.score >= 70 ? 'B' : 'D'}
                    </Badge>
                  </div>
                </GlassCard>

                <GlassCard className="lg:col-span-2">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tight">Technical Profile</h3>
                      <p className="text-slate-500 text-xs font-medium">Passive fingerprinting results</p>
                    </div>
                    <Cpu className="text-indigo-500 w-6 h-6" />
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-slate-400 text-sm">Target URL</span>
                      <span className="text-white font-bold text-sm flex items-center gap-2">
                        {result.url} <ExternalLink className="w-3 h-3 text-slate-500" />
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-slate-400 text-sm">Detected Stack</span>
                      <span className="text-indigo-400 font-black text-sm uppercase">{result.cms || 'Custom Engine'}</span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <Activity className="text-indigo-500 w-6 h-6 mb-4" />
                    <h3 className="text-white font-black text-xl mb-1 uppercase tracking-tight">Actions</h3>
                    <p className="text-slate-500 text-xs font-medium">Reporting & Exports</p>
                  </div>
                  <div className="space-y-3 mt-8">
                    <button onClick={exportPDF} className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button onClick={() => setHistory([])} className="w-full py-4 text-slate-500 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest transition-all">
                      Clear Local Data
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* Analysis Table */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Header Vulnerability Analysis</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                        <th className="pb-6">Security Parameter</th>
                        <th className="pb-6 text-center">Status</th>
                        <th className="pb-6">Remediation Blueprint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Object.entries(result.headers).map(([header, status]) => (
                        <tr key={header} className="group">
                          <td className="py-6 font-bold text-white text-sm">{header}</td>
                          <td className="py-6 text-center">
                            {status === 'Present' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-500 mx-auto" />
                            )}
                          </td>
                          <td className="py-6">
                            <p className={`text-xs ${status === 'Present' ? 'text-slate-500' : 'text-slate-300 font-medium'}`}>
                              {status === 'Missing' ? (
                                <span className="flex items-start gap-2">
                                  <Info className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                                  {getRemediation(header)}
                                </span>
                              ) : 'Compliance verified.'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* History */}
          {!result && !loading && history.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20">
              <div className="flex items-center gap-4 mb-8">
                <History className="text-indigo-500 w-5 h-5" />
                <h3 className="text-white font-black uppercase tracking-widest text-sm">Recent Audit Vault</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleScan(item.url)}
                    className="group bg-white/5 border border-white/10 p-6 rounded-3xl cursor-pointer hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-cyber-dark border border-white/10 flex items-center justify-center text-indigo-500 font-black text-xs">
                        {item.score}
                      </div>
                      <Badge color="text-slate-500 border-white/10">Audit</Badge>
                    </div>
                    <p className="text-white font-bold truncate mb-1">{item.url}</p>
                    <p className="text-slate-500 text-[10px] font-medium uppercase tracking-tighter">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-white/5 py-12 text-center">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
          Strictly for authorized passive auditing only. v1.0.2 Pro
        </p>
        <div className="flex justify-center gap-6 text-slate-600">
          <Shield className="w-4 h-4" />
          <Activity className="w-4 h-4" />
          <Cpu className="w-4 h-4" />
        </div>
      </footer>
    </div>
  );
}
