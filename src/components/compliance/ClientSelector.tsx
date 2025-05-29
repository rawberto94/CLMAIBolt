import React, { useState } from 'react';
import { X, Search, Building2 } from 'lucide-react';

interface ClientSelectorProps {
  onClose: () => void;
  onSelect: (clientId: string) => void;
  selectedClient: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  onClose,
  onSelect,
  selectedClient
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock client data - replace with actual client data
  const clients = [
    { id: 'client1', name: 'Acme Corporation', industry: 'Technology' },
    { id: 'client2', name: 'Global Industries', industry: 'Manufacturing' },
    { id: 'client3', name: 'Tech Solutions Ltd', industry: 'Software' },
    { id: 'client4', name: 'Finance Corp', industry: 'Financial Services' },
    { id: 'client5', name: 'Healthcare Plus', industry: 'Healthcare' },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredClients.map(client => (
              <button
                key={client.id}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  selectedClient === client.id
                    ? 'bg-primary-50 border-primary-200'
                    : 'hover:bg-gray-50 border-transparent'
                } border`}
                onClick={() => onSelect(client.id)}
              >
                <div className="flex-shrink-0">
                  <Building2 className={`h-6 w-6 ${
                    selectedClient === client.id ? 'text-primary-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-3 flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  <div className="text-xs text-gray-500">{client.industry}</div>
                </div>
              </button>
            ))}
            {filteredClients.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No clients found matching your search
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedClient) {
                  onSelect(selectedClient);
                }
              }}
              disabled={!selectedClient}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              Select Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;