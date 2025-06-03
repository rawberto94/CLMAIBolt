import React, { useState } from 'react';
import { FileText, BarChart2, ArrowRight, Search, Filter, Download, Share2, Settings, DollarSign, Database } from 'lucide-react';
import ContractAnalyzer from '../documents/ContractAnalyzer';
import ProjectEvaluation from '../evaluation/ProjectEvaluation';
import RfpManagementSystem from './RfpManagementSystem';
import RateCardsBenchmarker from './RateCardsBenchmarker';
import ContractAnalysisDemo from './ContractAnalysisDemo';

const ToolsPage: React.FC = () => {
  // Get the current sub-route from the URL hash
  const hash = window.location.hash.slice(1);
  const [_, subRoute] = hash.split('/');

  const tools = [
    {
      id: 'analyzer',
      name: 'Basic Contract Analyzer',
      description: 'Analyze contracts and documents using AI to extract key information and insights.',
      icon: FileText,
      features: [
        'Extract key terms and clauses',
        'Identify potential risks and obligations',
        'Generate summary reports',
        'AI-powered contract analysis',
        'PDF and text document support',
        'Automated compliance checking'
      ]
    },
    {
      id: 'evaluation',
      name: 'Advanced Project Evaluation',
      description: 'Evaluate and compare vendors using customizable criteria and scoring matrices.',
      icon: BarChart2,
      features: [
        'Create evaluation templates',
        'Score and compare vendors',
        'Collaborative assessment',
        'Generate evaluation reports',
        'Real-time collaboration',
        'Vendor self-assessment portal'
      ]
    },
    {
      id: 'rfp',
      name: 'RFP Management System',
      description: 'Create, manage, and evaluate RFPs with AI-powered assistance for procurement teams.',
      icon: FileText,
      features: [
        'AI-powered RFP draft assistant',
        'Clause suggestion & risk flagging',
        'Vendor submission portal',
        'Proposal scoring & evaluation',
        'Real-time dashboard & workflow',
        'Automated notifications'
      ]
    }
    ,
    {
      id: 'ratecards',
      name: 'Rate Cards Benchmarker',
      description: 'Upload, view, filter, and compare rate cards across suppliers, countries, and service categories.',
      icon: DollarSign,
      features: [
        'Upload Excel or CSV rate card data',
        'Filter by country, service group, or supplier',
        'Compare rates side-by-side',
        'Convert currencies for accurate comparison',
        'Visualize pricing trends with charts',
        'Export comparison results'
      ]
    },
    {
      id: 'contract-demo',
      name: 'Contract Analysis Demo',
      description: 'Interactive demonstration of contract analysis capabilities with sample data and visualizations.',
      icon: FileText,
      features: [
        'Analyze sample contracts',
        'Extract key financial terms',
        'Identify delivery deadlines',
        'Highlight legal obligations',
        'Assess compliance requirements',
        'Compare against industry benchmarks'
      ]
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Render the appropriate tool based on the sub-route
  const renderTool = () => {
    switch (subRoute) {
      case 'analyzer':
        return <ContractAnalyzer />;
      case 'evaluation':
        return <ProjectEvaluation />;
      case 'rfp':
        return <RfpManagementSystem />;
      case 'ratecards':
        return <RateCardsBenchmarker />;
      case 'contract-demo':
        return <ContractAnalysisDemo />;
      default:
        // Show a tool selection screen by default
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map(tool => (
              <div
                key={tool.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                onClick={() => { window.location.hash = `tools/${tool.id}`; }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <tool.icon className="h-8 w-8 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">{tool.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{tool.description}</p>
                  <ul className="space-y-3">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 bg-primary-200 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center text-primary-600 hover:text-primary-700 font-medium">
                    Launch Tool
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tools & Analytics</h1>
            <p className="text-gray-600">Access powerful tools for contract analysis and vendor evaluation</p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {!subRoute && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tools..."
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {renderTool()}
      
      {!subRoute && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Contract Analysis Completed</p>
                  <p className="text-sm text-gray-500">Master Service Agreement - Acme Corp</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <BarChart2 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Vendor Evaluation Updated</p>
                  <p className="text-sm text-gray-500">Tech Systems Evaluation Q1 2025</p>
                  <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Analyzed Documents</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Active Evaluations</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolsPage;