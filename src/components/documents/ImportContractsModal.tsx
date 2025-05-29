import React, { useState } from 'react';
import { X, Upload, FileText, AlertTriangle, Download, Check, RefreshCw } from 'lucide-react';

interface ImportContractsModalProps {
  onClose: () => void;
  onImport: (data: any) => void;
}

interface ImportPreview {
  fileName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  message?: string;
  data?: any;
}

const ImportContractsModal: React.FC<ImportContractsModalProps> = ({ onClose, onImport }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [importFormat, setImportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({
    'Title': 'title',
    'Type': 'type', 
    'Status': 'status',
    'Value': 'value',
    'Currency': 'currency',
    'EffectiveDate': 'effectiveDate',
    'ExpirationDate': 'expirationDate',
    'Supplier': 'supplier',
    'Client': 'client'
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (newFiles: File[]) => {
    setFiles(newFiles);
    setValidationErrors([]);
    
    // Reset previews
    setPreviews(newFiles.map(file => ({
      fileName: file.name,
      status: 'pending',
    })));

    // Process each file
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const errors: string[] = [];
      try {
        const preview = await previewFile(file);
        
        // Validate data structure
        if (Array.isArray(preview)) {
          preview.forEach((row, index) => {
            if (!row.Title) errors.push(`Row ${index + 1}: Missing Title`);
            if (!row.Type) errors.push(`Row ${index + 1}: Missing Type`);
            if (row.Value && isNaN(parseFloat(row.Value))) {
              errors.push(`Row ${index + 1}: Invalid Value format`);
            }
            if (row.EffectiveDate && !isValidDate(row.EffectiveDate)) {
              errors.push(`Row ${index + 1}: Invalid Effective Date format`);
            }
            if (row.ExpirationDate && !isValidDate(row.ExpirationDate)) {
              errors.push(`Row ${index + 1}: Invalid Expiration Date format`);
            }
          });
        }

        if (errors.length > 0) {
          setValidationErrors(prev => [...prev, ...errors]);
          setPreviews(prev => prev.map((p, index) => 
            index === i ? { ...p, status: 'error', message: 'Validation errors found' } : p
          ));
        } else {
        setPreviews(prev => prev.map((p, index) => 
          index === i ? { ...p, status: 'success', data: preview } : p
        ));
        }
      } catch (error) {
        setPreviews(prev => prev.map((p, index) => 
          index === i ? { ...p, status: 'error', message: (error as Error).message } : p
        ));
      }
    }
  };

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const previewFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          let data: any[];
          
          if (file.name.endsWith('.csv')) {
            data = parseCSV(content);
          } else if (file.name.endsWith('.json')) {
            data = JSON.parse(content);
          } else {
            throw new Error('Unsupported file format');
          }

          // Validate basic structure
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format - expected an array of contracts');
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file format'));
      }
    });
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {} as Record<string, string>);
    });
  };

  const downloadTemplate = () => {
    const template = 'Title,Type,Status,Value,Currency,EffectiveDate,ExpirationDate,Supplier,Client\n' +
                    'Master Service Agreement,Contract,Active,100000,USD,2025-01-01,2026-01-01,Acme Corp,Our Company\n' +
                    'Software License,License,Draft,50000,USD,2025-02-01,2026-02-01,Tech Systems,Our Company';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImporting(true);
    
    try {
      // Process and validate each file
      const results = await Promise.all(
        previews
          .filter(p => p.status === 'success')
          .map(async p => {
            // Apply field mapping if defined
            const mappedData = p.data.map((item: any) => {
              const mapped: Record<string, any> = {};
              Object.entries(fieldMapping).forEach(([from, to]) => {
                mapped[to] = item[from];
              });
              return mapped;
            });
            
            return mappedData;
          })
      );
      
      // Combine all results
      const allData = results.flat();
      
      // Call the onImport callback with the processed data
      onImport(allData);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      // Handle error appropriately
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Import Contracts</h2>
            <p className="mt-1 text-sm text-gray-500">
              Import contracts from CSV, Excel, or JSON files
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Import Format</h3>
              <p className="text-sm text-gray-500">Download the template to ensure correct format</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </button>
          </div>

          <div className="flex space-x-4">
            {['csv', 'excel', 'json'].map((format) => (
              <button
                key={format}
                onClick={() => setImportFormat(format as any)}
                className={`flex-1 py-2 px-4 rounded-lg border-2 ${
                  importFormat === format
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">
                    {format.toUpperCase()}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                  <span>Upload files</span>
                  <input
                    type="file"
                    className="sr-only"
                    multiple
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                CSV, Excel, or JSON files
              </p>
            </div>
          </div>

          {previews.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Files to Import</h3>
              <div className="space-y-3">
                {previews.map((preview, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {preview.fileName}
                        </p>
                        {preview.status === 'error' && (
                          <p className="text-xs text-red-600">{preview.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {preview.status === 'pending' && (
                        <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                      )}
                      {preview.status === 'success' && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {preview.status === 'error' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {previews.some(p => p.status === 'success') && (
            <div className="mt-6">
              <button
                onClick={() => setShowMappingDialog(true)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Configure Field Mapping
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !previews.some(p => p.status === 'success')}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center"
          >
            {importing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Contracts
              </>
            )}
          </button>
        </div>
      </div>

      {showMappingDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Field Mapping</h3>
              <button
                onClick={() => setShowMappingDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {Object.keys(previews[0]?.data?.[0] || {}).map((field) => (
                <div key={field} className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {field}
                    </label>
                  </div>
                  <div>
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={fieldMapping[field] || ''}
                      onChange={(e) => {
                        setFieldMapping(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }));
                      }}
                    >
                      <option value="">Don't import</option>
                      <option value="title">Contract Title</option>
                      <option value="type">Contract Type</option>
                      <option value="status">Status</option>
                      <option value="value">Value</option>
                      <option value="currency">Currency</option>
                      <option value="effectiveDate">Effective Date</option>
                      <option value="expirationDate">Expiration Date</option>
                      <option value="supplier">Supplier</option>
                      <option value="client">Client</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowMappingDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMappingDialog(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
              >
                Apply Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportContractsModal;