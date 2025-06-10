import React from 'react';
import { DollarSign } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { RateCardTable } from './RateCardTable'; // We import the sub-component here

// Define the props that this component will accept
interface FinancialsSectionProps {
  financials: AnalysisResult['financials'];
}

export const FinancialsSection = ({ financials }: FinancialsSectionProps) => {
  if (!financials) {
    return null; // Don't render if there's no financial data
  }

  // Destructure for easier access
  const { totalValue, currency, paymentTerms, rateCards, fees, budgetAllocation } = financials;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);

  return (
    <CollapsibleSection title="Financial Analysis" icon={DollarSign} defaultOpen>
      <div className="space-y-8">
        {/* Top Section with Payment Terms and Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-3">Payment Terms</h4>
            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Schedule:</span> <span className="font-medium text-gray-800">{paymentTerms.schedule}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Terms:</span> <span className="font-medium text-gray-800">{paymentTerms.terms}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Late Fee:</span> <span className="font-medium text-gray-800">{paymentTerms.latePaymentFee}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Early Discount:</span> <span className="font-medium text-gray-800">{paymentTerms.earlyPaymentDiscount}</span></div>
            </div>
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-3">Budget Allocation</h4>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              {(Object.keys(budgetAllocation) as Array<keyof typeof budgetAllocation>).map(year => (
                <div key={year}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{year}:</span>
                    <span className="font-medium text-gray-800">{formatCurrency(budgetAllocation[year])}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(budgetAllocation[year] / totalValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rate Card Table Section */}
        <div>
          <h4 className="text-base font-semibold text-gray-800 mb-3">Rate Card</h4>
          <RateCardTable rateCards={rateCards} currency={currency} />
        </div>
        
        {/* Additional Fees Section */}
        {fees && fees.length > 0 && (
          <div>
            <h4 className="text-base font-semibold text-gray-800 mb-3">Additional Fees</h4>
            <div className="space-y-2">
              {fees.map((fee, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-gray-800">{fee.type}</p>
                  <p className="text-gray-600">{fee.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Cap: {fee.cap}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
