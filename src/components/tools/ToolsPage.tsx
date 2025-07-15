import React, { useState, useEffect, useMemo } from 'react';
import { FileText, BarChart2, ArrowRight, Search, Filter, Settings, FileSearch, Calculator, Beaker } from 'lucide-react';

// Import the existing components
import ContractAnalyzer from '../documents/ContractAnalyzer';
import ProjectEvaluation from '../evaluation/ProjectEvaluation';

// Import the missing components from the rfp folder
import RfpManagementSystem from './tools/RfpManagementSystem';
import RateCardsBenchmarker from './tools/RateCardsBenchmarker';
import ContractAnalysisDemo from './tools/ContractAnalysisDemo';

const ToolsPage: React.FC = () => {
    // --- State Management ---
    const [subRoute, setSubRoute] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // --- Data Definition for ALL Tools ---
    const tools = [
        {
            id: 'analyzer',
            name: 'AI Contract Analyzer',
            description: 'Analyze documents using AI to extract key information, risks, and insights.',
            icon: FileText,
            component: <ContractAnalyzer />,
            features: [
                'Extract key terms and clauses',
                'Identify potential risks and obligations',
                'Generate summary reports',
                'AI-powered contract analysis'
            ]
        },
        {
            id: 'evaluation',
            name: 'Advanced Project Evaluation',
            description: 'Evaluate and compare vendors using customizable criteria and scoring matrices.',
            icon: BarChart2,
            component: <ProjectEvaluation />,
            features: [
                'Create evaluation templates',
                'Score and compare vendors',
                'Collaborative assessment',
                'Generate evaluation reports'
            ]
        },
        {
            id: 'rfp-system',
            name: 'RFP Management System',
            description: 'Manage Request for Proposals from creation to vendor selection.',
            icon: FileSearch,
            component: <RfpManagementSystem />,
            features: [
                'Create and manage RFPs',
                'Track vendor responses',
                'Automated scoring and evaluation',
                'Collaborative review process'
            ]
        },
        {
            id: 'rate-cards',
            name: 'Rate Cards Benchmarker',
            description: 'Compare and benchmark rate cards across vendors and services.',
            icon: Calculator,
            component: <RateCardsBenchmarker />,
            features: [
                'Import and compare rate cards',
                'Benchmark against industry standards',
                'Identify cost optimization opportunities',
                'Generate comparison reports'
            ]
        },
        {
            id: 'contract-demo',
            name: 'Contract Analysis Demo',
            description: 'Interactive demonstration of contract analysis capabilities.',
            icon: Beaker,
            component: <ContractAnalysisDemo />,
            features: [
                'Live contract analysis examples',
                'Interactive feature exploration',
                'Sample reports and outputs',
                'Guided walkthrough'
            ]
        }
    ];

    // --- Routing Logic ---
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            const parts = hash.split('/');
            setSubRoute(parts[1] || null);
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // --- Rendering Logic ---
    const activeTool = tools.find(tool => tool.id === subRoute);

    const filteredTools = useMemo(() => {
        if (!searchQuery) return tools;
        return tools.filter(tool =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, tools]);

    // If a sub-route is active, show that tool's component
    if (activeTool) {
        return activeTool.component;
    }

    // --- Default View: The Tool Selection Screen ---
    return (
        <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tools & Analytics</h1>
                        <p className="text-gray-600 mt-1">Access powerful tools for contract analysis and vendor evaluation.</p>
                    </div>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                    </button>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tools..."
                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map(tool => (
                    <div
                        key={tool.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col cursor-pointer"
                        onClick={() => { window.location.hash = `tools/${tool.id}`; }}
                    >
                        <div className="p-6 flex-grow">
                            <div className="flex items-center mb-4">
                                <tool.icon className="h-8 w-8 text-blue-600" />
                                <h3 className="text-xl font-semibold text-gray-900 ml-4">{tool.name}</h3>
                            </div>
                            <p className="text-gray-600 mb-5">{tool.description}</p>
                            <ul className="space-y-2">
                                {tool.features.slice(0, 3).map((feature, index) => (
                                    <li key={index} className="flex items-center text-sm text-gray-600">
                                        <ArrowRight className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
                            <div className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer flex items-center">
                                Launch Tool
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ToolsPage;
