import React from 'react';
import { AnalysisResult } from '../../types';

// Define the props: it just needs the array of rate cards
interface RateCardTableProps {
  rateCards: AnalysisResult['financials']['rateCards'];
  currency: AnalysisResult['financials']['currency'];
}

export const RateCardTable = ({ rateCards, currency }: RateCardTableProps) => {
  if (!rateCards || rateCards.length === 0) {
    return <p className="text-sm text-gray-500">No rate card data available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rate
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rateCards.map((rate, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{rate.role}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 text-right">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(rate.rate)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{rate.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
