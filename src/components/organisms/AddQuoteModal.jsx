import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { dealsService } from "@/services/api/dealsService";

const AddQuoteModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    quoteNumber: "",
    dealId: "",
    quoteDate: "",
    validUntilDate: "",
    amount: "",
    notes: "",
    status: "Draft",
    tags: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Sent", label: "Sent" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Expired", label: "Expired" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadDeals();
    }
  }, [isOpen]);

  const loadDeals = async () => {
    try {
      setLoadingDeals(true);
      const dealsData = await dealsService.getAll();
      setDeals(dealsData);
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast.error('Failed to load deals');
      setDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Quote name is required";
    }
    
    if (!formData.quoteNumber.trim()) {
      newErrors.quoteNumber = "Quote number is required";
    }
    
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = "Amount must be a valid number";
    }
    
    if (formData.quoteDate && formData.validUntilDate) {
      const quoteDate = new Date(formData.quoteDate);
      const validDate = new Date(formData.validUntilDate);
      if (validDate < quoteDate) {
        newErrors.validUntilDate = "Valid until date must be after quote date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const processedData = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : 0
      };
      
      await onSave(processedData);
      
      // Reset form
      setFormData({
        name: "",
        quoteNumber: "",
        dealId: "",
        quoteDate: "",
        validUntilDate: "",
        amount: "",
        notes: "",
        status: "Draft",
        tags: ""
      });
      
      setErrors({});
      onClose();
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        quoteNumber: "",
        dealId: "",
        quoteDate: "",
        validUntilDate: "",
        amount: "",
        notes: "",
        status: "Draft",
        tags: ""
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Quote"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Quote Name"
            type="text"
            value={formData.name}
            onChange={handleChange("name")}
            error={errors.name}
            placeholder="Enter quote name"
            required
            disabled={isLoading}
          />
          
          <FormField
            label="Quote Number"
            type="text"
            value={formData.quoteNumber}
            onChange={handleChange("quoteNumber")}
            error={errors.quoteNumber}
            placeholder="e.g., Q-2024-001"
            required
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Deal
            </label>
            <select
              value={formData.dealId}
              onChange={handleChange("dealId")}
              disabled={isLoading || loadingDeals}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              <option value="">Select a deal (optional)</option>
              {deals.map((deal) => (
                <option key={deal.Id} value={deal.Id}>
                  {deal.title} - {deal.company}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={handleChange("status")}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Quote Date"
            type="date"
            value={formData.quoteDate}
            onChange={handleChange("quoteDate")}
            error={errors.quoteDate}
            disabled={isLoading}
          />
          
          <FormField
            label="Valid Until"
            type="date"
            value={formData.validUntilDate}
            onChange={handleChange("validUntilDate")}
            error={errors.validUntilDate}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange("amount")}
            error={errors.amount}
            placeholder="0.00"
            disabled={isLoading}
          />
          
          <FormField
            label="Tags"
            type="text"
            value={formData.tags}
            onChange={handleChange("tags")}
            error={errors.tags}
            placeholder="e.g., priority, urgent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder="Add any additional notes about the quote..."
            rows={4}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-white resize-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? "Creating..." : "Create Quote"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddQuoteModal;