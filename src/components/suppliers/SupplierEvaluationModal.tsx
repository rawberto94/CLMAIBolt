import React, { useState } from 'react';
import EvaluationModal from './evaluation/EvaluationModal';
import type { VendorRating } from '../../types/EvaluationCriteria';

interface SupplierEvaluationModalProps {
  onClose: () => void;
}

const SupplierEvaluationModal: React.FC<SupplierEvaluationModalProps> = ({ onClose }) => {
  const handleSave = (vendorRating: VendorRating) => {
    console.log('Saving vendor rating:', vendorRating);
    // Here you would typically save the rating to your backend
    onClose();
  };

  return (
    <EvaluationModal onClose={onClose} onSave={handleSave} />
  );
};


export default SupplierEvaluationModal