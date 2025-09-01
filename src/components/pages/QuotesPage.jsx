import { useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import QuoteTable from "@/components/organisms/QuoteTable";
import AddQuoteModal from "@/components/organisms/AddQuoteModal";
import QuoteDetailModal from "@/components/organisms/QuoteDetailModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import quotesService from "@/services/api/quotesService";

const QuotesPage = () => {
  const { toggleSidebar } = useOutletContext();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", direction: "desc" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const quotesData = await quotesService.getAll();
      setQuotes(quotesData);
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError('Failed to load quotes. Please try again.');
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filteredAndSortedQuotes = useMemo(() => {
    let filtered = quotes;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.name.toLowerCase().includes(term) ||
        (quote.quoteNumber || "").toLowerCase().includes(term) ||
        (quote.dealName || "").toLowerCase().includes(term) ||
        (quote.status || "").toLowerCase().includes(term)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue = a[field];
      let bValue = b[field];

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Handle dates
      if (field === "quoteDate" || field === "validUntilDate" || field === "createdAt" || field === "updatedAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle numbers
      if (field === "amount") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle strings
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [quotes, searchTerm, sortConfig]);

  const handleAddQuote = async (quoteData) => {
    try {
      const newQuote = await quotesService.create(quoteData);
      setQuotes(prevQuotes => [newQuote, ...prevQuotes]);
      toast.success('Quote created successfully!');
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast.error('Failed to create quote. Please try again.');
      throw error;
    }
  };

  const handleQuoteClick = (quote) => {
    setSelectedQuote(quote);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Quotes" onMenuClick={toggleSidebar} />
        <div className="p-6">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Quotes" onMenuClick={toggleSidebar} />
        <div className="p-6">
          <Error message={error} onRetry={loadQuotes} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Quotes"
        onMenuClick={toggleSidebar}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
        buttonText="Add Quote"
      />

      <div className="p-6">
        <QuoteTable
          quotes={filteredAndSortedQuotes}
          onQuoteClick={handleQuoteClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      <AddQuoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddQuote}
      />

      <QuoteDetailModal
        quote={selectedQuote}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedQuote(null);
        }}
      />
    </div>
  );
};

export default QuotesPage;