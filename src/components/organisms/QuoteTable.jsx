import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import TableHeader from "@/components/molecules/TableHeader";
import { cn } from "@/utils/cn";

const QuoteTable = ({ 
  quotes, 
  onQuoteClick, 
  sortConfig, 
  onSort 
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortDirection = (field) => {
    if (sortConfig?.field === field) {
      return sortConfig.direction;
    }
    return null;
  };

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

  if (!quotes || quotes.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <ApperIcon name="DollarSign" className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No quotes</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating your first quote.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <TableHeader
                label="Quote"
                sortable
                sortDirection={getSortDirection("name")}
                onSort={() => handleSort("name")}
              />
              <TableHeader
                label="Quote Number"
                sortable
                sortDirection={getSortDirection("quoteNumber")}
                onSort={() => handleSort("quoteNumber")}
              />
              <TableHeader
                label="Deal"
                sortable
                sortDirection={getSortDirection("dealName")}
                onSort={() => handleSort("dealName")}
              />
              <TableHeader
                label="Amount"
                sortable
                sortDirection={getSortDirection("amount")}
                onSort={() => handleSort("amount")}
                className="text-right"
              />
              <TableHeader
                label="Status"
                sortable
                sortDirection={getSortDirection("status")}
                onSort={() => handleSort("status")}
                className="text-center"
              />
              <TableHeader
                label="Quote Date"
                sortable
                sortDirection={getSortDirection("quoteDate")}
                onSort={() => handleSort("quoteDate")}
              />
              <TableHeader
                label="Valid Until"
                sortable
                sortDirection={getSortDirection("validUntilDate")}
                onSort={() => handleSort("validUntilDate")}
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {quotes.map((quote, index) => (
              <tr
                key={quote.Id}
                onClick={() => onQuoteClick(quote)}
                className={cn(
                  "table-row-hover transition-colors duration-150",
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <ApperIcon name="FileText" className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {quote.name || 'Untitled Quote'}
                      </div>
                      {quote.tags && (
                        <div className="text-xs text-slate-500">
                          {quote.tags}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {quote.quoteNumber || '—'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {quote.dealName || 'No Deal'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-slate-900">
                    {formatCurrency(quote.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    getStatusBadgeClass(quote.status)
                  )}>
                    <ApperIcon name={getStatusIcon(quote.status)} className="h-3 w-3 mr-1" />
                    {quote.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-500">
                    {quote.quoteDate 
                      ? format(new Date(quote.quoteDate), "MMM dd, yyyy")
                      : "—"
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={cn(
                    "text-sm",
                    quote.validUntilDate && new Date(quote.validUntilDate) < new Date()
                      ? "text-red-600 font-medium"
                      : "text-slate-500"
                  )}>
                    {quote.validUntilDate 
                      ? format(new Date(quote.validUntilDate), "MMM dd, yyyy")
                      : "—"
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteTable;