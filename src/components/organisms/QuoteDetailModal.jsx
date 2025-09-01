import React, { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const QuoteDetailModal = ({ quote, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'Draft': 'bg-slate-100 text-slate-800',
      'Sent': 'bg-blue-100 text-blue-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Expired': 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status] || statusClasses['Draft'];
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'Draft': 'FileText',
      'Sent': 'Send',
      'Accepted': 'CheckCircle',
      'Rejected': 'XCircle',
      'Expired': 'Clock'
    };
    return statusIcons[status] || statusIcons['Draft'];
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "FileText" },
    { id: "deal", label: "Deal Info", icon: "Target" },
    { id: "details", label: "Details", icon: "Info" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Quote Header */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {quote.name || 'Untitled Quote'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <span className="font-medium">Quote Number:</span>
                    <span>{quote.quoteNumber || 'Not set'}</span>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  getStatusBadgeClass(quote.status)
                )}>
                  <ApperIcon name={getStatusIcon(quote.status)} className="h-4 w-4 mr-1" />
                  {quote.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Quote Amount</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(quote.amount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-600 mb-1">Quote Date</div>
                  <div className="text-lg font-medium text-slate-900">
                    {quote.quoteDate 
                      ? format(new Date(quote.quoteDate), "MMM dd, yyyy")
                      : "Not set"
                    }
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-slate-600 mb-1">Valid Until</div>
                  <div className={cn(
                    "text-lg font-medium",
                    quote.validUntilDate && new Date(quote.validUntilDate) < new Date()
                      ? "text-red-600"
                      : "text-slate-900"
                  )}>
                    {quote.validUntilDate 
                      ? format(new Date(quote.validUntilDate), "MMM dd, yyyy")
                      : "Not set"
                    }
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {quote.tags && (
              <Card className="p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {quote.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            {quote.notes && (
              <Card className="p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{quote.notes}</p>
              </Card>
            )}
          </div>
        );

      case "deal":
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <ApperIcon name="Target" className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Associated Deal
                  </h3>
                  <p className="text-sm text-slate-600">
                    Deal information for this quote
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Deal Name</div>
                    <div className="text-lg font-medium text-slate-900">
                      {quote.dealName || 'No Deal Associated'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Deal ID</div>
                    <div className="text-lg font-medium text-slate-900">
                      {quote.dealId || 'Not linked'}
                    </div>
                  </div>
                </div>

                {!quote.dealId && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ApperIcon name="AlertTriangle" className="h-5 w-5 text-amber-600 mr-2" />
                      <span className="text-sm text-amber-800">
                        This quote is not associated with any deal.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );

      case "details":
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quote Details
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Created</div>
                    <div className="text-sm text-slate-900">
                      {quote.createdAt 
                        ? format(new Date(quote.createdAt), "MMM dd, yyyy 'at' h:mm a")
                        : "Not available"
                      }
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Last Updated</div>
                    <div className="text-sm text-slate-900">
                      {quote.updatedAt 
                        ? format(new Date(quote.updatedAt), "MMM dd, yyyy 'at' h:mm a")
                        : "Not available"
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-600 mb-1">Quote ID</div>
                  <div className="text-sm text-slate-900 font-mono">
                    {quote.Id}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600 mb-3">Status History</div>
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      quote.status === 'Draft' ? 'bg-slate-400' :
                      quote.status === 'Sent' ? 'bg-blue-400' :
                      quote.status === 'Accepted' ? 'bg-green-400' :
                      quote.status === 'Rejected' ? 'bg-red-400' :
                      'bg-orange-400'
                    )} />
                    <span className="text-sm text-slate-900">
                      Current status: <span className="font-medium">{quote.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!quote) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quote Details"
      size="2xl"
    >
      <div className="flex flex-col h-full">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                <ApperIcon name={tab.icon} className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-6">
          {renderTabContent()}
        </div>
      </div>
    </Modal>
  );
};

export default QuoteDetailModal;