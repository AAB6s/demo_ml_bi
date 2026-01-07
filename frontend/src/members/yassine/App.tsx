import React, { useState, useCallback, useMemo } from 'react';
import { Upload, X, AlertCircle, Users, TrendingUp, MapPin, Building2, Target, Award, Search } from 'lucide-react';

// File Upload Component
const FileUploadZone = ({ onFileSelect, uploading }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        dragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border bg-card/50 hover:border-primary/50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv"
        onChange={handleChange}
        disabled={uploading}
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {uploading ? 'Uploading...' : 'Upload HR Data CSV'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your CSV file here, or click to browse
        </p>
        <span className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
          Select File
        </span>
      </label>
    </div>
  );
};

// Dashboard Visualizations
const Dashboard = ({ data, onReset }) => {
  const { dashboard, employees } = data;
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  // Filter employees based on search and risk level
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.employee_id.toString().includes(searchTerm.toLowerCase()) ||
        emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRisk = riskFilter === 'All' || emp.retention_risk === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [employees, searchTerm, riskFilter]);

  // Calculate risk distribution for chart
  const riskData = [
    { label: 'High Risk', count: dashboard.high_risk_count, color: 'bg-red-500', percentage: ((dashboard.high_risk_count / dashboard.total_employees) * 100).toFixed(1) },
    { label: 'Medium Risk', count: dashboard.medium_risk_count, color: 'bg-yellow-500', percentage: ((dashboard.medium_risk_count / dashboard.total_employees) * 100).toFixed(1) },
    { label: 'Low Risk', count: dashboard.low_risk_count, color: 'bg-green-500', percentage: ((dashboard.low_risk_count / dashboard.total_employees) * 100).toFixed(1) }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">HR Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">Complete workforce insights and salary analysis</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Upload New File
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Total Employees</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{dashboard.total_employees.toLocaleString()}</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Avg Salary</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">${dashboard.avg_salary.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Predicted: ${dashboard.avg_predicted_salary.toFixed(0)}</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Underpaid</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{dashboard.total_underpaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{((dashboard.total_underpaid / dashboard.total_employees) * 100).toFixed(1)}% of workforce</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-purple-600" />
            <h3 className="text-sm font-medium text-muted-foreground">Overpaid</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{dashboard.total_overpaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{((dashboard.total_overpaid / dashboard.total_employees) * 100).toFixed(1)}% of workforce</p>
        </div>
      </div>

      {/* Retention Risk Distribution */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Retention Risk Distribution
        </h3>
        <div className="space-y-4">
          {riskData.map((risk) => (
            <div key={risk.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{risk.label}</span>
                <span className="text-sm text-muted-foreground">{risk.count.toLocaleString()} ({risk.percentage}%)</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`${risk.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${risk.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Analysis */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Department Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboard.by_department.map((dept) => (
            <div key={dept.department} className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground text-lg">{dept.department}</h4>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium text-foreground">{dept.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Salary:</span>
                  <span className="font-medium text-foreground">${dept.avg_salary.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg Gap:</span>
                  <span className={`font-medium ${dept.avg_gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${dept.avg_gap.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Analysis */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.by_location.map((loc) => (
            <div key={loc.location} className="p-4 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground">{loc.location}</h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{loc.count.toLocaleString()}</span> employees
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg: <span className="font-medium text-foreground">${loc.avg_salary.toFixed(0)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Group Analysis */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <h3 className="text-xl font-semibold text-foreground mb-4">Peer Group Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Group</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Count</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Experience</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Performance</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.by_peer_group.map((group) => (
                <tr key={group.peer_group} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">Group {group.peer_group}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{group.count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{group.avg_experience.toFixed(1)} years</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">{group.avg_performance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample Employees with Filters */}
      <div className="p-6 bg-card border border-border rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-foreground">Employee Records</h3>
          <p className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID, title, department, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Risk Filter */}
          <div className="sm:w-48">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="All">All Risk Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Salary</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Gap</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.slice(0, 50).map((emp) => (
                  <tr key={emp.employee_id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 text-foreground font-medium">{emp.employee_id}</td>
                    <td className="py-3 px-4 text-foreground">{emp.job_title}</td>
                    <td className="py-3 px-4 text-foreground">{emp.department}</td>
                    <td className="py-3 px-4 text-foreground">{emp.location}</td>
                    <td className="py-3 px-4 text-right text-foreground">${emp.salary.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-right font-medium ${emp.salary_gap < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${emp.salary_gap.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.retention_risk === 'High' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : emp.retention_risk === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {emp.retention_risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No employees match your filter criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setRiskFilter('All');
              }}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const HRCsvUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/hr/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
      setTimeout(() => {
        document.getElementById('dashboard-section')?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
    setError('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">HR Analytics Platform</h1>
        <p className="text-muted-foreground">Upload your employee data to unlock powerful workforce insights</p>
      </div>

      {/* Upload Section */}
      {!data && (
        <div className="max-w-2xl mx-auto">
          <FileUploadZone onFileSelect={handleFileSelect} uploading={uploading} />
          
          {file && !uploading && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-destructive transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Dashboard */}
      <div id="dashboard-section">
        {data && <Dashboard data={data} onReset={handleReset} />}
      </div>
    </div>
  );
};

export default HRCsvUpload;