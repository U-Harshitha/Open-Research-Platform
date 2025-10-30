import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Database, 
  ExternalLink, 
  Download, 
  Trash2, 
  Eye, 
  BarChart3,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { AssetService } from '../services/firebaseServices.js';
import apiService from '../services/apiService.js';

const AssetManager = ({ 
  assets = [], 
  onAddAsset, 
  onRemoveAsset, 
  onAssetAnalysis,
  isReadOnly = false 
}) => {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [loadingAnalysis, setLoadingAnalysis] = useState({});
  const [assetModal, setAssetModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    type: 'paper',
    title: '',
    url: '',
    description: '',
    authors: '',
    tags: '',
    datePublished: ''
  });

  // Asset type configurations
  const assetTypes = {
    paper: {
      label: 'Research Paper',
      icon: BookOpen,
      color: 'blue',
      fields: ['title', 'url', 'authors', 'description', 'datePublished', 'tags']
    },
    dataset: {
      label: 'Dataset',
      icon: Database,
      color: 'green',
      fields: ['title', 'url', 'description', 'tags', 'dataFormat']
    },
    code: {
      label: 'Code Repository',
      icon: ExternalLink,
      color: 'purple',
      fields: ['title', 'url', 'description', 'language', 'tags']
    },
    tool: {
      label: 'Research Tool',
      icon: Eye,
      color: 'orange',
      fields: ['title', 'url', 'description', 'platform', 'tags']
    }
  };

  const handleAddAsset = async () => {
    if (!newAsset.title || !newAsset.url) {
      return;
    }

    const asset = {
      ...newAsset,
      id: Date.now().toString(),
      addedAt: new Date().toISOString(),
      tags: newAsset.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    try {
      await onAddAsset(asset);
      setNewAsset({
        type: 'paper',
        title: '',
        url: '',
        description: '',
        authors: '',
        tags: '',
        datePublished: ''
      });
      setAssetModal(false);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const analyzeAsset = async (asset) => {
    if (loadingAnalysis[asset.id]) return;

    setLoadingAnalysis(prev => ({ ...prev, [asset.id]: true }));

    try {
      let content = asset.description || asset.title;
      
      // Try to fetch additional content from URL if it's accessible
      if (asset.url && (asset.url.includes('.pdf') || asset.url.includes('arxiv'))) {
        content += ` URL: ${asset.url}`;
      }

      const result = await apiService.analyzeAsset(asset.type, content);
      
      setAnalysisResults(prev => ({
        ...prev,
        [asset.id]: result
      }));

      if (onAssetAnalysis) {
        onAssetAnalysis(asset.id, result);
      }
    } catch (error) {
      console.error('Asset analysis failed:', error);
      setAnalysisResults(prev => ({
        ...prev,
        [asset.id]: { error: error.message }
      }));
    } finally {
      setLoadingAnalysis(prev => ({ ...prev, [asset.id]: false }));
    }
  };

  const AssetCard = ({ asset }) => {
    const config = assetTypes[asset.type] || assetTypes.paper;
    const Icon = config.icon;
    const analysis = analysisResults[asset.id];
    const isAnalyzing = loadingAnalysis[asset.id];

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-${config.color}-50 mr-3`}>
              <Icon className={`w-5 h-5 text-${config.color}-600`} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {asset.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {config.label}
              </p>
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="flex space-x-1">
              <button
                onClick={() => analyzeAsset(asset)}
                disabled={isAnalyzing}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Analyze Asset"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onRemoveAsset(asset.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Remove Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {asset.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {asset.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {asset.authors && (
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">{asset.authors}</span>
            </div>
          )}
          
          {asset.datePublished && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(asset.datePublished).getFullYear()}</span>
            </div>
          )}
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{asset.tags.length - 3} more</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <a
            href={asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Asset
          </a>
          
          {analysis && (
            <div className="flex items-center">
              {analysis.error ? (
                <AlertCircle className="w-4 h-4 text-red-500" title="Analysis failed" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" title="Analysis complete" />
              )}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && !analysis.error && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="text-xs font-medium text-gray-700 mb-2">AI Analysis</h5>
            
            {analysis.key_insights && analysis.key_insights.length > 0 && (
              <div className="mb-3">
                <h6 className="text-xs font-medium text-gray-600 mb-1">Key Insights</h6>
                <ul className="text-xs text-gray-600 space-y-1">
                  {analysis.key_insights.slice(0, 3).map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="line-clamp-2">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.quantitative_data && analysis.quantitative_data.length > 0 && (
              <div className="mb-3">
                <h6 className="text-xs font-medium text-gray-600 mb-1">Key Statistics</h6>
                <div className="flex flex-wrap gap-2">
                  {analysis.quantitative_data.slice(0, 4).map((data, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {data.context}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {selectedAsset === asset.id ? 'Hide Details' : 'Show Full Analysis'}
            </button>
          </div>
        )}

        {/* Expanded Analysis */}
        {selectedAsset === asset.id && analysis && !analysis.error && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-medium text-blue-800 mb-3">Complete Analysis</h5>
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {analysis.analysis}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Research Assets</h3>
          <p className="text-sm text-gray-600">
            Papers, datasets, and tools linked to this document
          </p>
        </div>
        
        {!isReadOnly && (
          <button
            onClick={() => setAssetModal(true)}
            className="btn-primary"
          >
            Add Asset
          </button>
        )}
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Assets Yet</h4>
          <p className="text-gray-600 mb-4">
            Add research papers, datasets, or tools to enhance your document
          </p>
          {!isReadOnly && (
            <button
              onClick={() => setAssetModal(true)}
              className="btn-primary"
            >
              Add Your First Asset
            </button>
          )}
        </div>
      )}

      {/* Add Asset Modal */}
      {assetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Research Asset</h3>
              
              <div className="space-y-4">
                {/* Asset Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(assetTypes).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          onClick={() => setNewAsset({...newAsset, type})}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            newAsset.type === type
                              ? `border-${config.color}-500 bg-${config.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className={`w-5 h-5 mr-3 text-${config.color}-600`} />
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Fields */}
                {assetTypes[newAsset.type].fields.map((field) => {
                  const fieldConfig = {
                    title: { label: 'Title', type: 'text', required: true, placeholder: 'Asset title' },
                    url: { label: 'URL', type: 'url', required: true, placeholder: 'https://...' },
                    authors: { label: 'Authors', type: 'text', placeholder: 'Author names' },
                    description: { label: 'Description', type: 'textarea', placeholder: 'Brief description' },
                    tags: { label: 'Tags', type: 'text', placeholder: 'machine learning, data science, etc.' },
                    datePublished: { label: 'Publication Date', type: 'date' },
                    dataFormat: { label: 'Data Format', type: 'text', placeholder: 'CSV, JSON, etc.' },
                    language: { label: 'Programming Language', type: 'text', placeholder: 'Python, R, etc.' },
                    platform: { label: 'Platform', type: 'text', placeholder: 'Web, Desktop, etc.' }
                  };

                  const config = fieldConfig[field];
                  if (!config) return null;

                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {config.label}
                        {config.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {config.type === 'textarea' ? (
                        <textarea
                          value={newAsset[field] || ''}
                          onChange={(e) => setNewAsset({...newAsset, [field]: e.target.value})}
                          className="input-field h-20 resize-none"
                          placeholder={config.placeholder}
                        />
                      ) : (
                        <input
                          type={config.type}
                          value={newAsset[field] || ''}
                          onChange={(e) => setNewAsset({...newAsset, [field]: e.target.value})}
                          className="input-field"
                          placeholder={config.placeholder}
                          required={config.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setAssetModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAsset}
                  disabled={!newAsset.title || !newAsset.url}
                  className="btn-primary flex-1"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;