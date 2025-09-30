import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Filter, 
  Download, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Tag,
  Globe,
  Eye,
  Shield,
  Database,
  Search,
  X,
  RefreshCw
} from 'lucide-react';

// Result Analysis Engine
class ResultAnalysisEngine {
  constructor() {
    this.riskKeywords = {
      critical: ['password', 'secret', 'confidential', 'admin', 'root', 'database', 'backup'],
      high: ['internal', 'private', 'restricted', 'config', 'env', 'credentials', 'login'],
      medium: ['personal', 'contact', 'phone', 'email', 'address', 'profile'],
      low: ['public', 'about', 'general', 'info']
    };
    
    this.domainCategories = {
      social: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com', 'snapchat.com'],
      professional: ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'crunchbase.com'],
      academic: ['researchgate.net', 'academia.edu', 'scholar.google.com', 'orcid.org', 'arxiv.org'],
      code: ['github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'codepen.io'],
      leak: ['pastebin.com', 'ghostbin.com', 'justpaste.it', 'controlc.com', 'hastebin.com'],
      news: ['cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 'wsj.com'],
      government: ['.gov', '.mil', '.edu']
    };
  }

  analyzeResult(result) {
    const analysis = {
      riskLevel: this.assessRisk(result),
      category: this.categorizeSource(result.url),
      confidence: this.calculateConfidence(result),
      relevance: this.calculateRelevance(result),
      metadata: this.extractMetadata(result)
    };
    
    return { ...result, analysis };
  }

  assessRisk(result) {
    const text = `${result.title} ${result.snippet} ${result.url}`.toLowerCase();
    
    for (const [level, keywords] of Object.entries(this.riskKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return level;
      }
    }
    return 'low';
  }

  categorizeSource(url) {
    const domain = new URL(url).hostname.toLowerCase();
    
    for (const [category, domains] of Object.entries(this.domainCategories)) {
      if (domains.some(d => domain.includes(d))) {
        return category;
      }
    }
    return 'other';
  }

  calculateConfidence(result) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on various factors
    if (result.engines && result.engines.length > 1) confidence += 0.2;
    if (result.title && result.title.length > 20) confidence += 0.1;
    if (result.snippet && result.snippet.length > 50) confidence += 0.1;
    if (result.url && result.url.includes('https')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  calculateRelevance(result) {
    // Simple relevance calculation based on title and snippet matching
    // In a real implementation, this would use more sophisticated NLP
    return Math.random() * 0.5 + 0.5; // Mock relevance between 0.5-1.0
  }

  extractMetadata(result) {
    const metadata = {};
    
    try {
      const url = new URL(result.url);
      metadata.domain = url.hostname;
      metadata.protocol = url.protocol;
      metadata.path = url.pathname;
    } catch (e) {
      metadata.domain = 'unknown';
    }
    
    metadata.titleLength = result.title?.length || 0;
    metadata.snippetLength = result.snippet?.length || 0;
    metadata.hasImage = Boolean(result.image);
    
    return metadata;
  }

  aggregateResults(results) {
    const aggregated = {
      total: results.length,
      byRisk: this.groupByRisk(results),
      byCategory: this.groupByCategory(results),
      byEngine: this.groupByEngine(results),
      topDomains: this.getTopDomains(results),
      insights: this.generateInsights(results)
    };
    
    return aggregated;
  }

  groupByRisk(results) {
    return results.reduce((acc, result) => {
      const risk = result.analysis?.riskLevel || 'low';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});
  }

  groupByCategory(results) {
    return results.reduce((acc, result) => {
      const category = result.analysis?.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }

  groupByEngine(results) {
    return results.reduce((acc, result) => {
      const engines = result.engines || ['unknown'];
      engines.forEach(engine => {
        acc[engine] = (acc[engine] || 0) + 1;
      });
      return acc;
    }, {});
  }

  getTopDomains(results) {
    const domains = results.reduce((acc, result) => {
      const domain = result.analysis?.metadata?.domain || 'unknown';
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(domains)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([domain, count]) => ({ domain, count }));
  }

  generateInsights(results) {
    const insights = [];
    const total = results.length;
    
    if (total === 0) return insights;
    
    // Risk analysis
    const highRisk = results.filter(r => ['critical', 'high'].includes(r.analysis?.riskLevel)).length;
    if (highRisk > 0) {
      insights.push({
        type: 'warning',
        title: 'High Risk Results Found',
        description: `${highRisk} out of ${total} results contain potentially sensitive information.`,
        action: 'Review high-risk results carefully'
      });
    }
    
    // Coverage analysis
    const categories = this.groupByCategory(results);
    const categoryCount = Object.keys(categories).length;
    if (categoryCount > 3) {
      insights.push({
        type: 'info',
        title: 'Comprehensive Coverage',
        description: `Results found across ${categoryCount} different source categories.`,
        action: 'Consider focusing on specific categories'
      });
    }
    
    // Engine diversity
    const engines = this.groupByEngine(results);
    const engineCount = Object.keys(engines).length;
    if (engineCount === 1) {
      insights.push({
        type: 'suggestion',
        title: 'Single Engine Search',
        description: 'Results from only one search engine. Consider multi-engine search for broader coverage.',
        action: 'Enable multi-engine search'
      });
    }
    
    return insights;
  }
}

// Results Aggregation Component
function ResultsAggregation({ results, onUpdateResults, investigationName }) {
  const [analysisEngine] = useState(() => new ResultAnalysisEngine());
  const [analyzedResults, setAnalyzedResults] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [filters, setFilters] = useState({
    risk: [],
    category: [],
    engine: [],
    confidence: 0
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('list'); // list, grid, analytics
  const [selectedResults, setSelectedResults] = useState(new Set());

  useEffect(() => {
    if (results && results.length > 0) {
      const analyzed = results.map(result => analysisEngine.analyzeResult(result));
      setAnalyzedResults(analyzed);
      setAggregatedData(analysisEngine.aggregateResults(analyzed));
    }
  }, [results, analysisEngine]);

  const filteredResults = useMemo(() => {
    let filtered = [...analyzedResults];
    
    // Apply filters
    if (filters.risk.length > 0) {
      filtered = filtered.filter(r => filters.risk.includes(r.analysis?.riskLevel));
    }
    
    if (filters.category.length > 0) {
      filtered = filtered.filter(r => filters.category.includes(r.analysis?.category));
    }
    
    if (filters.engine.length > 0) {
      filtered = filtered.filter(r => 
        r.engines?.some(engine => filters.engine.includes(engine))
      );
    }
    
    if (filters.confidence > 0) {
      filtered = filtered.filter(r => (r.analysis?.confidence || 0) >= filters.confidence);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.analysis?.relevance || 0) - (a.analysis?.relevance || 0);
        case 'confidence':
          return (b.analysis?.confidence || 0) - (a.analysis?.confidence || 0);
        case 'risk':
          const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (riskOrder[b.analysis?.riskLevel] || 0) - (riskOrder[a.analysis?.riskLevel] || 0);
        case 'date':
          return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [analyzedResults, filters, sortBy]);

  const exportResults = () => {
    const exportData = {
      investigation: investigationName,
      summary: aggregatedData,
      results: filteredResults,
      filters: filters,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRiskColor = (risk) => {
    const colors = {
      critical: 'text-purple-800 bg-purple-100',
      high: 'text-red-800 bg-red-100',
      medium: 'text-yellow-800 bg-yellow-100',
      low: 'text-green-800 bg-green-100'
    };
    return colors[risk] || colors.low;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      social: Globe,
      professional: Star,
      academic: Database,
      code: Database,
      leak: AlertTriangle,
      news: Globe,
      government: Shield,
      other: Tag
    };
    return icons[category] || Tag;
  };

  if (!aggregatedData) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No results to analyze yet</p>
          <p className="text-sm text-gray-400">Run a search to see aggregated results and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Results Analytics</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'analytics' ? 'list' : 'analytics')}
              className="btn-secondary text-sm"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              {viewMode === 'analytics' ? 'List View' : 'Analytics'}
            </button>
            <button onClick={exportResults} className="btn-secondary text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{aggregatedData.total}</div>
            <div className="text-sm text-gray-600">Total Results</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-900">
              {(aggregatedData.byRisk.critical || 0) + (aggregatedData.byRisk.high || 0)}
            </div>
            <div className="text-sm text-red-600">High Risk</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-900">
              {Object.keys(aggregatedData.byCategory).length}
            </div>
            <div className="text-sm text-blue-600">Source Types</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-900">
              {Object.keys(aggregatedData.byEngine).length}
            </div>
            <div className="text-sm text-green-600">Search Engines</div>
          </div>
        </div>

        {/* Insights */}
        {aggregatedData.insights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Key Insights</h3>
            <div className="space-y-2">
              {aggregatedData.insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                  insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
                    {insight.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
                    {insight.type === 'suggestion' && <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5" />}
                    <div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{insight.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Risk Distribution</h3>
              <div className="space-y-2">
                {Object.entries(aggregatedData.byRisk).map(([risk, count]) => (
                  <div key={risk} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(risk)}`}>
                      {risk.charAt(0).toUpperCase() + risk.slice(1)}
                    </span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Categories */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Source Categories</h3>
              <div className="space-y-2">
                {Object.entries(aggregatedData.byCategory).map(([category, count]) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-700 capitalize">{category}</span>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Domains */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-3">Top Domains</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {aggregatedData.topDomains.map(({ domain, count }) => (
                  <div key={domain} className="bg-white rounded p-2 text-center">
                    <div className="text-sm font-medium text-gray-900 truncate" title={domain}>
                      {domain}
                    </div>
                    <div className="text-xs text-gray-500">{count} results</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Filters & Sorting</h3>
          <button
            onClick={() => setFilters({ risk: [], category: [], engine: [], confidence: 0 })}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Risk Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Risk Level</label>
            <div className="space-y-1">
              {['critical', 'high', 'medium', 'low'].map(risk => (
                <label key={risk} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.risk.includes(risk)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, risk: [...f.risk, risk] }));
                      } else {
                        setFilters(f => ({ ...f, risk: f.risk.filter(r => r !== risk) }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-xs capitalize">{risk}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Source Category</label>
            <div className="space-y-1">
              {Object.keys(aggregatedData.byCategory).map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, category: [...f.category, category] }));
                      } else {
                        setFilters(f => ({ ...f, category: f.category.filter(c => c !== category) }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                  />
                  <span className="text-xs capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="confidence">Confidence</option>
              <option value="risk">Risk Level</option>
              <option value="date">Date</option>
            </select>
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">
              Min Confidence ({(filters.confidence * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.confidence}
              onChange={(e) => setFilters(f => ({ ...f, confidence: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">
            Results ({filteredResults.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedResults(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No results match your filters</p>
            <p className="text-sm text-gray-400">Try adjusting your filter criteria</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedResults.has(index)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedResults);
                          if (e.target.checked) {
                            newSelected.add(index);
                          } else {
                            newSelected.delete(index);
                          }
                          setSelectedResults(newSelected);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <h4 className="font-medium text-gray-900 hover:text-blue-600">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.title}
                        </a>
                      </h4>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{result.snippet}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{result.analysis?.metadata?.domain}</span>
                      {result.engines && (
                        <span>• Found on: {result.engines.join(', ')}</span>
                      )}
                      <span>• Confidence: {((result.analysis?.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(result.analysis?.riskLevel)}`}>
                      {result.analysis?.riskLevel}
                    </span>
                    
                    {result.analysis?.category && (
                      <div className="flex items-center gap-1">
                        {React.createElement(getCategoryIcon(result.analysis.category), {
                          className: "w-3 h-3 text-gray-500"
                        })}
                        <span className="text-xs text-gray-500 capitalize">
                          {result.analysis.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultsAggregation;