'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import SignaturePad from '@/components/SignaturePad';
import { CreateSignatureDto } from '@/types/signature';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSignatureDto) => Promise<void>;
  proposalTitle: string;
  isLoading?: boolean;
}

export default function SignatureModal({
  isOpen,
  onClose,
  onSubmit,
  proposalTitle,
  isLoading = false,
}: SignatureModalProps) {
  const [formData, setFormData] = useState({
    signerName: '',
    signerEmail: '',
  });
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.signerName.trim()) {
      newErrors.signerName = 'Name is required';
    }

    if (!formData.signerEmail.trim()) {
      newErrors.signerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.signerEmail)) {
      newErrors.signerEmail = 'Please enter a valid email address';
    }

    if (!signatureData) {
      newErrors.signature = 'Please draw your signature';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        signerName: formData.signerName,
        signerEmail: formData.signerEmail,
        signatureData: signatureData || undefined,
      });
      
      // Reset form
      setFormData({ signerName: '', signerEmail: '' });
      setSignatureData(null);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error submitting signature:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSignatureChange = (signature: string | null) => {
    setSignatureData(signature);
    // Clear signature error when user draws
    if (errors.signature && signature) {
      setErrors(prev => ({ ...prev, signature: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Proposal">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sign: {proposalTitle}
          </h3>
          <p className="text-sm text-gray-600">
            Please provide your details and signature to complete the signing process.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            label="Full Name"
            required
            error={errors.signerName}
          >
            <Input
              type="text"
              value={formData.signerName}
              onChange={(e) => handleInputChange('signerName', e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Email Address"
            required
            error={errors.signerEmail}
          >
            <Input
              type="email"
              value={formData.signerEmail}
              onChange={(e) => handleInputChange('signerEmail', e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Digital Signature"
            required
            error={errors.signature}
          >
            <SignaturePad
              onSignatureChange={handleSignatureChange}
              width={400}
              height={150}
            />
          </FormField>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Legal Agreement</h4>
          <p className="text-sm text-gray-600">
            By signing this proposal, you acknowledge that:
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
            <li>You have read and understood the proposal terms</li>
            <li>You agree to be legally bound by the terms outlined</li>
            <li>Your digital signature has the same legal effect as a handwritten signature</li>
            <li>You are authorized to sign on behalf of your organization (if applicable)</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Signing...' : 'Sign Proposal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
