import { AnalysisResult, AnalysisProgress } from '../types';

// This function now generates mock data matching the new detailed structure
const generateMockAnalysis = (fileName: string, taxonomy: string): AnalysisResult => {
  return {
    overview: {
      title: fileName,
      type: taxonomy,
      status: "Active",
      parties: ["Your Company", "Vendor Inc."],
      effectiveDate: "2025-01-01",
      expirationDate: "2027-12-31",
      totalValue: "$1,250,000",
      description: "This Master Service Agreement (MSA) establishes the terms under which Vendor Inc. will provide services to Your Company."
    },
    financials: {
      totalValue: 1250000,
      currency: "USD",
      paymentTerms: { schedule: "Monthly", terms: "Net 45", latePaymentFee: "1.5% monthly", earlyPaymentDiscount: "2% if paid within 15 days" },
      rateCards: [ { role: "Senior Developer", rate: 150, unit: "hourly" }, { role: "Project Manager", rate: 175, unit: "hourly" }],
      fees: [{ type: "Travel Expenses", description: "Billed at cost", cap: "Not to exceed 15% of monthly fees" }],
      invoicingFrequency: "Monthly",
      budgetAllocation: { year1: 400000, year2: 425000, year3: 425000 }
    },
    obligations: {
      deliverables: [ { description: "Initial Assessment Report", deadline: "30 days after effective date", status: "At Risk" }, { description: "Phase 1 Implementation", deadline: "Q2 2025", status: "On Track" } ],
      serviceLevel: { availability: "99.9%", responseTime: { critical: "1 hour", high: "4 hours", medium: "8 hours", low: "24 hours" }, penalties: "2% service credit" },
      reporting: { frequency: "Monthly", contents: ["Service level performance", "Project status", "Budget utilization"] },
      keyPersonnel: [{ role: "Project Manager", replaceability: "With client approval" }]
    },
    risks: [
      { category: "Financial", description: "Payment terms (Net 45) exceed industry standard (Net 30)", severity: "Medium", impact: "Potential cash flow issues", mitigation: "Monitor accounts receivable closely" },
      { category: "Compliance", description: "Data protection provisions may not fully address GDPR requirements", severity: "High", impact: "Potential regulatory non-compliance", mitigation: "Immediate review by privacy counsel" }
    ],
    compliance: {
      score: 78,
      requirements: [ { category: "Data Protection", status: "Partial", details: "GDPR provisions incomplete" }, { category: "Intellectual Property", status: "Compliant", details: "Clear ownership provisions" } ],
      industryRegulations: [ { name: "GDPR", status: "At Risk", details: "Missing specific data subject rights provisions" } ]
    },
    recommendations: [
      { priority: "High", description: "Amend data protection provisions to fully address GDPR", benefit: "Mitigate compliance risk", effort: "Medium" },
      { priority: "Medium", description: "Renegotiate payment terms to Net 30", benefit: "Improve cash flow", effort: "Low" }
    ],
    benchmarks: {
      rateComparison: { averageRate: 162.5, marketAverage: 155, percentile: 65 },
      termComparison: {
        paymentTerms: { contract: "Net 45", marketAverage: "Net 30", status: "Above Average (Unfavorable)" },
        contractLength: { contract: "36 months", marketAverage: "24 months", status: "Above Average (Favorable)" },
        terminationNotice: { contract: "60 days", marketAverage: "45 days", status: "Above Average (Favorable)" }
      }
    }
  };
};

type ProgressCallback = (progress: AnalysisProgress) => void;

export const handleAnalysisRequest = async (
    file: File,
    taxonomy: string,
    onProgress: ProgressCallback
): Promise<AnalysisResult> => {
    console.log("Frontend service started...");
    onProgress({ status: 'uploading', percentage: 25 });
    
    // In a real app, this is where you would make the API call to your Gemini backend.
    // The backend would do the RAG and return the JSON.
    // For now, we simulate that process.
    await new Promise(res => setTimeout(res, 1000));
    onProgress({ status: 'analyzing', percentage: 75 });
    await new Promise(res => setTimeout(res, 2000));

    // We now return the new, detailed mock data structure.
    const result = generateMockAnalysis(file.name, taxonomy);
    
    onProgress({ status: 'complete', percentage: 100 });
    return result;
};

export const initializeContractRAG = async () => {
    console.log("Initializing frontend service...");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Frontend service ready.");
    return true;
};
