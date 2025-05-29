import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Search, 
  Filter, 
  DollarSign, 
  BarChart2, 
  RefreshCw, 
  X, 
  Check, 
  AlertTriangle,
  Globe,
  Building2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Info,
  Tag,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CATEGORIES } from '../shared/TaxonomyFilter';
import { saveToLocalStorage, getFromLocalStorage } from '../../services/storageService';

interface RateCard {
  id: string;
  supplier: string;
  country: string;
  serviceGroup: string;
  role: string;
  level: string;
  rate: number;
  currency: string;
  effectiveDate: string;
  expirationDate: string;
  category?: {
    l1?: string;
    l2?: string;
  };
  contractType?: string;
  skillLevel?: string;
  source?: string;
  isNegotiated?: boolean;
  notes?: string;
}

interface FilterState {
  suppliers: string[];
  countries: string[];
  serviceGroups: string[];
  roles: string[];
  levels: string[];
  categories: {
    l1: string[];
    l2: string[];
  };
  contractTypes: string[];
  skillLevels: string[];
  sources: string[];
  negotiated: string | null;
  dateRange: {
    start: string;
    end: string;
  };
}

const RateCardsBenchmarker: React.FC = () => {
  const [rateCards, setRateCards] = useState<RateCard[]>(
    getFromLocalStorage<RateCard[]>('rateCards', [])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    suppliers: [],
    countries: [],
    serviceGroups: [],
    roles: [],
    levels: [],
    categories: {
      l1: [],
      l2: []
    },
    contractTypes: [],
    skillLevels: [],
    sources: [],
    negotiated: null,
    dateRange: { start: '', end: '' }
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [sortField, setSortField] = useState<string>('supplier');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let count = 0;
    count += filters.suppliers.length;
    count += filters.countries.length;
    count += filters.serviceGroups.length;
    count += filters.roles.length;
    count += filters.levels.length;
    count += filters.categories.l1.length;
    count += filters.categories.l2.length;
    count += filters.contractTypes.length;
    count += filters.skillLevels.length;
    count += filters.sources.length;
    if (filters.negotiated !== null) count++;
    if (filters.dateRange.start) count++;
    if (filters.dateRange.end) count++;
    setActiveFilterCount(count);
  }, [filters]);

  useEffect(() => {
    if (rateCards.length > 0) {
      saveToLocalStorage('rateCards', rateCards);
    }
  }, [rateCards]);

  const availableSuppliers = Array.from(new Set(rateCards.map(card => card.supplier)));
  const availableCountries = Array.from(new Set(rateCards.map(card => card.country)));
  const availableServiceGroups = Array.from(new Set(rateCards.map(card => card.serviceGroup)));
  const availableRoles = Array.from(new Set(rateCards.map(card => card.role)));
  const availableLevels = Array.from(new Set(rateCards.map(card => card.level)));
  const availableContractTypes = Array.from(new Set(rateCards.map(card => card.contractType).filter(Boolean)));
  const availableSkillLevels = Array.from(new Set(rateCards.map(card => card.skillLevel).filter(Boolean)));
  const availableSources = Array.from(new Set(rateCards.map(card => card.source).filter(Boolean)));

  const availableL1Categories = Object.keys(CATEGORIES);

  const availableL2Categories = filters.categories.l1.length > 0
    ? filters.categories.l1.flatMap(l1 => CATEGORIES[l1] || [])
    : Object.values(CATEGORIES).flat();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const file = files[0];
      const data = await readExcelFile(file);
      setRateCards(data);
      saveToLocalStorage('rateCards', data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<RateCard[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }
          
          let jsonData: any[];
          
          if (file.name.endsWith('.csv')) {
            const text = data as string;
            jsonData = parseCSV(text);
          } else {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            jsonData = XLSX.utils.sheet_to_json(worksheet);
          }
          
          const rateCards: RateCard[] = jsonData.map((row: any, index) => {
            let l1: string | undefined = row.CategoryL1;
            let l2: string | undefined = row.CategoryL2;
            
            if (!l1 && !l2 && row.Category) {
              for (const [key, values] of Object.entries(CATEGORIES)) {
                if (key === row.Category) {
                  l1 = key;
                  break;
                }
                if (values.includes(row.Category)) {
                  l1 = key;
                  l2 = row.Category;
                  break;
                }
              }
            }
            
            if (!l1 && row.TaxonomyL1) {
              l1 = row.TaxonomyL1;
            }
            
            if (!l2 && row.TaxonomyL2) {
              l2 = row.TaxonomyL2;
            }
            
            return {
              id: `rate-${index}`,
              supplier: row.Supplier || 'Unknown',
              country: row.Country || 'Global',
              serviceGroup: row.ServiceGroup || row.Service || 'General',
              role: row.Role || row.Position || 'Unspecified',
              level: row.Level || row.Seniority || 'Standard',
              rate: parseFloat(row.Rate) || 0,
              currency: row.Currency || 'USD',
              effectiveDate: row.EffectiveDate || new Date().toISOString().split('T')[0],
              expirationDate: row.ExpirationDate || '',
              category: {
                l1,
                l2
              },
              contractType: row.ContractType || undefined,
              skillLevel: row.SkillLevel || undefined,
              source: row.Source || undefined,
              isNegotiated: row.IsNegotiated === 'TRUE' || row.IsNegotiated === true || undefined,
              notes: row.Notes || undefined
            };
          });
          
          resolve(rateCards);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n');
    if (lines.length === 0) return [];
    
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue.trim());
      
      return values;
    };
    
    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = parseCSVLine(line);
        return headers.reduce((obj, header, i) => {
          obj[header] = values[i] || '';
          return obj;
        }, {} as Record<string, string>);
      });
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    
    const dataToExport = filteredRateCards.map(card => ({
      Supplier: card.supplier,
      Country: card.country,
      ServiceGroup: card.serviceGroup,
      Role: card.role,
      Level: card.level,
      Rate: card.rate,
      Currency: card.currency,
      EffectiveDate: card.effectiveDate,
      ExpirationDate: card.expirationDate,
      CategoryL1: card.category?.l1 || '',
      CategoryL2: card.category?.l2 || '',
      ContractType: card.contractType || '',
      SkillLevel: card.skillLevel || '',
      Source: card.source || '',
      IsNegotiated: card.isNegotiated ? 'TRUE' : 'FALSE',
      Notes: card.notes || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Rate Cards');
    
    XLSX.writeFile(wb, 'rate_cards_export.xlsx');
  };

  const downloadTemplate = () => {
    const template = 'Supplier,Country,ServiceGroup,Role,Level,Rate,Currency,EffectiveDate,ExpirationDate,CategoryL1,CategoryL2,ContractType,SkillLevel,Source,IsNegotiated,Notes\n' +
                    'Acme Consulting,USA,IT Services,Software Developer,Senior,125,USD,2025-01-01,2025-12-31,IT,Software,T&M,Senior,RFP,TRUE,Negotiated rate for enterprise agreement\n' +
                    'TechPro Services,UK,IT Services,DevOps Engineer,Mid,95,GBP,2025-01-01,2025-12-31,IT,Infrastructure Services,T&M,Mid,Direct,FALSE,Standard rate card';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rate_cards_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all rate card data?')) {
      setRateCards([]);
      saveToLocalStorage('rateCards', []);
    }
  };

  const handleLoadSampleData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/sample_rate_cards.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch sample data');
      }
      
      const csvText = await response.text();
      const data = parseCSV(csvText);
      
      const rateCards: RateCard[] = data.map((row: any, index) => {
        let l1: string | undefined;
        let l2: string | undefined;
        
        if (row.Category) {
          for (const [key, values] of Object.entries(CATEGORIES)) {
            if (key === row.Category) {
              l1 = key;
              break;
            }
            if (values.includes(row.Category)) {
              l1 = key;
              l2 = row.Category;
              break;
            }
          }
        }
        
        return {
          id: `rate-${index}`,
          supplier: row.Supplier || 'Unknown',
          country: row.Country || 'Global',
          serviceGroup: row.ServiceGroup || row.Service || 'General',
          role: row.Role || row.Position || 'Unspecified',
          level: row.Level || row.Seniority || 'Standard',
          rate: parseFloat(row.Rate) || 0,
          currency: row.Currency || 'USD',
          effectiveDate: row.EffectiveDate || new Date().toISOString().split('T')[0],
          expirationDate: row.ExpirationDate || '',
          category: {
            l1: l1 || row.CategoryL1,
            l2: l2 || row.CategoryL2
          },
          contractType: row.ContractType || undefined,
          skillLevel: row.SkillLevel || undefined,
          source: row.Source || undefined,
          isNegotiated: row.IsNegotiated === 'TRUE' || row.IsNegotiated === true || undefined,
          notes: row.Notes || undefined
        };
      });
      
      setRateCards(rateCards);
      saveToLocalStorage('rateCards', rateCards);
      setShowSampleData(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRateCards = rateCards.filter(card => {
    const matchesSearch = 
      card.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.serviceGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.notes && card.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesL1 = filters.categories.l1.length === 0 || 
      (card.category?.l1 && filters.categories.l1.includes(card.category.l1));
    
    const matchesL2 = filters.categories.l2.length === 0 || 
      (card.category?.l2 && filters.categories.l2.includes(card.category.l2));
    
    const matchesSupplier = filters.suppliers.length === 0 || filters.suppliers.includes(card.supplier);
    const matchesCountry = filters.countries.length === 0 || filters.countries.includes(card.country);
    const matchesServiceGroup = filters.serviceGroups.length === 0 || filters.serviceGroups.includes(card.serviceGroup);
    const matchesRole = filters.roles.length === 0 || filters.roles.includes(card.role);
    const matchesLevel = filters.levels.length === 0 || filters.levels.includes(card.level);
    const matchesContractType = filters.contractTypes.length === 0 || 
      (card.contractType && filters.contractTypes.includes(card.contractType));
    const matchesSkillLevel = filters.skillLevels.length === 0 || 
      (card.skillLevel && filters.skillLevels.includes(card.skillLevel));
    const matchesSource = filters.sources.length === 0 || 
      (card.source && filters.sources.includes(card.source));
    
    const matchesNegotiated = filters.negotiated === null || 
      (filters.negotiated === 'yes' ? card.isNegotiated === true : card.isNegotiated !== true);
    
    const effectiveDate = new Date(card.effectiveDate);
    const matchesStartDate = !filters.dateRange.start || effectiveDate >= new Date(filters.dateRange.start);
    
    const expirationDate = card.expirationDate ? new Date(card.expirationDate) : null;
    const matchesEndDate = !filters.dateRange.end || 
      (expirationDate ? expirationDate <= new Date(filters.dateRange.end) : true);
    
    return matchesSearch && matchesSupplier && matchesCountry && matchesServiceGroup && 
           matchesRole && matchesLevel && matchesL1 && matchesL2 && matchesContractType && 
           matchesSkillLevel && matchesSource && matchesNegotiated && 
           matchesStartDate && matchesEndDate;
  });

  const sortedRateCards = [...filteredRateCards].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'supplier':
        comparison = a.supplier.localeCompare(b.supplier);
        break;
      case 'country':
        comparison = a.country.localeCompare(b.country);
        break;
      case 'serviceGroup':
        comparison = a.serviceGroup.localeCompare(b.serviceGroup);
        break;
      case 'role':
        comparison = a.role.localeCompare(b.role);
        break;
      case 'level':
        comparison = a.level.localeCompare(b.level);
        break;
      case 'rate':
        comparison = a.rate - b.rate;
        break;
      case 'effectiveDate':
        comparison = new Date(a.effectiveDate).getTime() - new Date(b.effectiveDate).getTime();
        break;
      default:
        comparison = a.supplier.localeCompare(b.supplier);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const convertCurrency = (rate: number, fromCurrency: string, toCurrency: string): number => {
    const rates: Record<string, number> = {
      'USD': 1,
      'EUR': 0.92,
      'GBP': 0.78,
      'JPY': 150.25,
      'CAD': 1.35
    };
    
    const inUSD = fromCurrency === 'USD' ? rate : rate / rates[fromCurrency];
    return toCurrency === 'USD' ? inUSD : inUSD * rates[toCurrency];
  };

  const getComparisonData = () => {
    if (selectedSuppliers.length === 0 || selectedRoles.length === 0) return [];
    
    return selectedRoles.map(role => {
      const result: Record<string, any> = { role };
      
      selectedSuppliers.forEach(supplier => {
        const matchingCards = filteredRateCards.filter(
          card => card.supplier === supplier && card.role === role
        );
        
        if (matchingCards.length > 0) {
          const totalRate = matchingCards.reduce((sum, card) => 
            sum + convertCurrency(card.rate, card.currency, selectedCurrency), 0);
          result[supplier] = totalRate / matchingCards.length;
        } else {
          result[supplier] = null;
        }
      });
      
      return result;
    });
  };

  const comparisonData = getComparisonData();

  const handleResetFilters = () => {
    setFilters({
      suppliers: [],
      countries: [],
      serviceGroups: [],
      roles: [],
      levels: [],
      categories: {
        l1: [],
        l2: []
      },
      contractTypes: [],
      skillLevels: [],
      sources: [],
      negotiated: null,
      dateRange: { start: '', end: '' }
    });
    setSearchQuery('');
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-primary-600" />
            Rate Cards Benchmarker
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Upload, view, filter, and compare rate cards across suppliers
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Info className="h-4 w-4 mr-2" />
            Help
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Rate Cards
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
          />
          
          <button
            onClick={handleExport}
            disabled={rateCards.length === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 text-primary-600 animate-spin" />
          <span className="ml-2 text-gray-600">Processing file...</span>
        </div>
      ) : rateCards.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rate Cards Uploaded</h3>
          <p className="text-gray-500 mb-6">
            Upload an Excel or CSV file containing rate card data to begin benchmarking
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Rate Cards
            </button>
            <button
              onClick={() => setShowSampleData(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Load Sample Data
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search rate cards..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="relative">
                  <button
                    className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-1 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {showFilterPanel && (
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-10 border border-gray-200 max-h-[80vh] overflow-y-auto">
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                          <button
                            onClick={() => setShowFilterPanel(false)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Category (L1)</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableL1Categories.map((category) => (
                              <label key={category} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.categories.l1.includes(category)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: {
                                          ...prev.categories,
                                          l1: [...prev.categories.l1, category]
                                        }
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: {
                                          ...prev.categories,
                                          l1: prev.categories.l1.filter(c => c !== category),
                                          l2: prev.categories.l2.filter(l2 => !CATEGORIES[category]?.includes(l2))
                                        }
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{category}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Category (L2)</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableL2Categories.map((category) => (
                              <label key={category} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.categories.l2.includes(category)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                
                                
                                      const l1Category = Object.entries(CATEGORIES).find(
                                        ([_, l2s]) => l2s.includes(category)
                                      )?.[0];
                                      
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: {
                                          l1: l1Category && !prev.categories.l1.includes(l1Category) 
                                            ? [...prev.categories.l1, l1Category]
                                            : prev.categories.l1,
                                          l2: [...prev.categories.l2, category]
                                        }
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: {
                                          ...prev.categories,
                                          l2: prev.categories.l2.filter(c => c !== category)
                                        }
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{category}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Supplier</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableSuppliers.map((supplier) => (
                              <label key={supplier} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.suppliers.includes(supplier)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        suppliers: [...prev.suppliers, supplier]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        suppliers: prev.suppliers.filter(s => s !== supplier)
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{supplier}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Country</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableCountries.map((country) => (
                              <label key={country} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.countries.includes(country)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        countries: [...prev.countries, country]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        countries: prev.countries.filter(c => c !== country)
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{country}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Service Group</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableServiceGroups.map((group) => (
                              <label key={group} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.serviceGroups.includes(group)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        serviceGroups: [...prev.serviceGroups, group]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        serviceGroups: prev.serviceGroups.filter(g => g !== group)
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{group}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Role</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableRoles.map((role) => (
                              <label key={role} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.roles.includes(role)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        roles: [...prev.roles, role]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        roles: prev.roles.filter(r => r !== role)
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Level</h4>
                          <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                            {availableLevels.map((level) => (
                              <label key={level} className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={filters.levels.includes(level)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        levels: [...prev.levels, level]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        levels: prev.levels.filter(l => l !== level)
                                      }));
                                    }
                                  }}
                                />
                                <span className="ml-2 text-sm text-gray-700">{level}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {availableContractTypes.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Contract Type</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                              {availableContractTypes.map((type) => (
                                <label key={type} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={filters.contractTypes.includes(type)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFilters(prev => ({
                                          ...prev,
                                          contractTypes: [...prev.contractTypes, type]
                                        }));
                                      } else {
                                        setFilters(prev => ({
                                          ...prev,
                                          contractTypes: prev.contractTypes.filter(t => t !== type)
                                        }));
                                      }
                                    }}
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {availableSkillLevels.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Skill Level</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                              {availableSkillLevels.map((level) => (
                                <label key={level} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={filters.skillLevels.includes(level)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFilters(prev => ({
                                          ...prev,
                                          skillLevels: [...prev.skillLevels, level]
                                        }));
                                      } else {
                                        setFilters(prev => ({
                                          ...prev,
                                          skillLevels: prev.skillLevels.filter(l => l !== level)
                                        }));
                                      }
                                    }}
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{level}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {availableSources.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Source</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                              {availableSources.map((source) => (
                                <label key={source} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    checked={filters.sources.includes(source)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setFilters(prev => ({
                                          ...prev,
                                          sources: [...prev.sources, source]
                                        }));
                                      } else {
                                        setFilters(prev => ({
                                          ...prev,
                                          sources: prev.sources.filter(s => s !== source)
                                        }));
                                      }
                                    }}
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{source}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Negotiated Rates</h4>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={filters.negotiated === null}
                                onChange={() => setFilters(prev => ({ ...prev, negotiated: null }))}
                              />
                              <span className="ml-2 text-sm text-gray-700">All</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={filters.negotiated === 'yes'}
                                onChange={() => setFilters(prev => ({ ...prev, negotiated: 'yes' }))}
                              />
                              <span className="ml-2 text-sm text-gray-700">Negotiated Only</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                checked={filters.negotiated === 'no'}
                                onChange={() => setFilters(prev => ({ ...prev, negotiated: 'no' }))}
                              />
                              <span className="ml-2 text-sm text-gray-700">Non-negotiated Only</span>
                            </label>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Date Range</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Effective From</label>
                              <input
                                type="date"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                                value={filters.dateRange.start}
                                onChange={(e) => setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, start: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Effective To</label>
                              <input
                                type="date"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                                value={filters.dateRange.end}
                                onChange={(e) => setFilters(prev => ({
                                  ...prev,
                                  dateRange: { ...prev.dateRange, end: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900"
                            onClick={handleResetFilters}
                          >
                            Reset All Filters
                          </button>
                          <button
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                            onClick={() => setShowFilterPanel(false)}
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <select
                  className="rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                </select>

                <button
                  onClick={() => setShowComparisonView(!showComparisonView)}
                  className={`px-4 py-2 text-sm font-medium ${
                    showComparisonView
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } rounded-md hover:bg-opacity-90 transition-colors duration-200`}
                >
                  <BarChart2 className="h-4 w-4 mr-2 inline" />
                  {showComparisonView ? 'List View' : 'Comparison View'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Rate Cards</h3>
              <div className="text-2xl font-bold text-primary-600">{rateCards.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                Showing {filteredRateCards.length} filtered results
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Suppliers</h3>
              <div className="text-2xl font-bold text-primary-600">{availableSuppliers.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {availableCountries.length} countries
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Roles</h3>
              <div className="text-2xl font-bold text-primary-600">{availableRoles.length}</div>
              <div className="text-sm text-gray-500 mt-1">
                {availableLevels.length} seniority levels
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rate Range</h3>
              <div className="text-2xl font-bold text-primary-600">
                {rateCards.length > 0 ? (
                  <>
                    {Math.min(...rateCards.map(card => 
                      convertCurrency(card.rate, card.currency, selectedCurrency)
                    )).toFixed(0)} - {Math.max(...rateCards.map(card => 
                      convertCurrency(card.rate, card.currency, selectedCurrency)
                    )).toFixed(0)} {selectedCurrency}
                  </>
                ) : 'N/A'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Avg: {rateCards.length > 0 ? (
                  rateCards.reduce((sum, card) => 
                    sum + convertCurrency(card.rate, card.currency, selectedCurrency), 0
                  ) / rateCards.length
                ).toFixed(2) : 'N/A'} {selectedCurrency}
              </div>
            </div>
          </div>

          {showComparisonView ? (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Comparison</h3>
              
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Suppliers to Compare
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                    {availableSuppliers.map((supplier) => (
                      <label key={supplier} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedSuppliers.includes(supplier)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSuppliers(prev => [...prev, supplier]);
                            } else {
                              setSelectedSuppliers(prev => prev.filter(s => s !== supplier));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{supplier}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Roles to Compare
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                    {availableRoles.map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          checked={selectedRoles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles(prev => [...prev, role]);
                            } else {
                              setSelectedRoles(prev => prev.filter(r => r !== role));
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              {comparisonData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        {selectedSuppliers.map(supplier => (
                          <th key={supplier} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {supplier}
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comparisonData.map((row, index) => {
                        const rates = selectedSuppliers.map(s => row[s]).filter(r => r !== null) as number[];
                        const min = rates.length > 0 ? Math.min(...rates) : 0;
                        const max = rates.length > 0 ? Math.max(...rates) : 0;
                        const variance = min === 0 ? 0 : ((max - min) / min) * 100;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.role}
                            </td>
                            {selectedSuppliers.map(supplier => (
                              <td key={supplier} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {row[supplier] !== null ? (
                                  <span className={`${
                                    rates.length > 0 && row[supplier] === min ? 'text-green-600 font-medium' :
                                    rates.length > 0 && row[supplier] === max ? 'text-red-600 font-medium' : ''
                                  }`}>
                                    {selectedCurrency === 'USD' ? '$' : 
                                     selectedCurrency === 'EUR' ? '€' : 
                                     selectedCurrency === 'GBP' ? '£' : 
                                     selectedCurrency === 'JPY' ? '¥' : '$'}
                                    {row[supplier].toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">N/A</span>
                                )}
                              </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                variance > 20 ? 'text-red-600' :
                                variance > 10 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {variance.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select at least one supplier and one role to compare rates
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('supplier')}
                      >
                        <div className="flex items-center">
                          Supplier
                          {sortField === 'supplier' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('country')}
                      >
                        <div className="flex items-center">
                          Country
                          {sortField === 'country' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('serviceGroup')}
                      >
                        <div className="flex items-center">
                          Service Group
                          {sortField === 'serviceGroup' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('role')}
                      >
                        <div className="flex items-center">
                          Role
                          {sortField === 'role' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('level')}
                      >
                        <div className="flex items-center">
                          Level
                          {sortField === 'level' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('rate')}
                      >
                        <div className="flex items-center">
                          Rate ({selectedCurrency})
                          {sortField === 'rate' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSortChange('effectiveDate')}
                      >
                        <div className="flex items-center">
                          Effective Date
                          {sortField === 'effectiveDate' && (
                            sortDirection === 'asc' ? 
                              <ChevronUp className="h-4 w-4 ml-1" /> : 
                              <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedRateCards.map((card) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{card.supplier}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-500">{card.country}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.serviceGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedCurrency === 'USD' ? '$' : 
                             selectedCurrency === 'EUR' ? '€' : 
                             selectedCurrency === 'GBP' ? '£' : 
                             selectedCurrency === 'JPY' ? '¥' : '$'}
                            {convertCurrency(card.rate, card.currency, selectedCurrency).toFixed(2)}
                          </div>
                          {card.currency !== selectedCurrency && (
                            <div className="text-xs text-gray-500">
                              (Original: {card.currency} {card.rate.toFixed(2)})
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(card.effectiveDate)}
                          {card.expirationDate && (
                            <div className="text-xs text-gray-400">
                              Expires: {formatDate(card.expirationDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.category?.l1 && (
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 text-gray-400 mr-1" />
                              <span>{card.category.l1}</span>
                              {card.category.l2 && (
                                <span className="ml-1 text-xs text-gray-400">/ {card.category.l2}</span>
                              )}
                            </div>
                          )}
                          {card.isNegotiated && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                              Negotiated
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {sortedRateCards.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                          No rate cards found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClearData}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
            >
              Clear All Data
            </button>
            <button
              onClick={() => setShowSampleData(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Load Sample Data
            </button>
          </div>
        </>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Rate Cards Benchmarker Help</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Getting Started</h4>
                <p className="text-sm text-gray-600">
                  The Rate Cards Benchmarker allows you to upload, view, filter, and compare rate cards across suppliers, countries, and service categories.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Uploading Data</h4>
                <p className="text-sm text-gray-600">
                  Click the "Upload Rate Cards" button to upload your Excel (.xlsx) or CSV file. The file should contain columns for Supplier, Country, ServiceGroup, Role, Level, Rate, and Currency at minimum.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Additional columns like Category, ContractType, SkillLevel, Source, IsNegotiated, and Notes will be recognized if present.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Filtering Data</h4>
                <p className="text-sm text-gray-600">
                  Use the Filter button to filter rate cards by various criteria including supplier, country, service group, role, level, category, and more.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Comparing Rates</h4>
                <p className="text-sm text-gray-600">
                  Click the "Comparison View" button to compare rates across suppliers and roles. Select the suppliers and roles you want to compare, and the system will display a side-by-side comparison with variance calculation.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Currency Conversion</h4>
                <p className="text-sm text-gray-600">
                  Use the currency dropdown to convert all rates to your preferred currency for easier comparison.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Exporting Data</h4>
                <p className="text-sm text-gray-600">
                  Click the "Export" button to export the filtered rate cards to an Excel file.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Sample Data</h4>
                <p className="text-sm text-gray-600">
                  If you don't have your own data, you can click "Load Sample Data" to load a set of sample rate cards for demonstration purposes.
                </p>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSampleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-primary-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Load Sample Data</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                This will load sample rate card data for demonstration purposes. Any existing data will be replaced.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowSampleData(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoadSampleData}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Load Sample Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateCardsBenchmarker;