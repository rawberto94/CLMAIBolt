import React from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ComplianceMetrics: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-primary-50 border-b border-primary-100">
        <h3 className="text-md font-medium text-primary-800 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Compliance Metrics
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center p-4 bg-primary-50 rounded-full mb-3">
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">85%</h4>
          <p className="text-sm text-gray-600">Overall Compliance</p>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Compliance Status</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Compliant Rules</span>
              </div>
              <span className="font-medium text-gray-900">42</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Warning Rules</span>
              </div>
              <span className="font-medium text-gray-900">7</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">Failed Rules</span>
              </div>
              <span className="font-medium text-gray-900">3</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Compliance Categories</h4>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">GDPR</span>
                <span className="text-xs text-gray-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">Contract Integrity</span>
                <span className="text-xs text-gray-600">84%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">Confidentiality</span>
                <span className="text-xs text-gray-600">96%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">SOX</span>
                <span className="text-xs text-gray-600">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <button className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-800">
            View Complete Compliance Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceMetrics;