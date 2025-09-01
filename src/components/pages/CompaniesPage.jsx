import { useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import CompanyTable from "@/components/organisms/CompanyTable";
import AddCompanyModal from "@/components/organisms/AddCompanyModal";
import CompanyDetailModal from "@/components/organisms/CompanyDetailModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import companiesService from "@/services/api/companiesService";

const CompaniesPage = () => {
  const { toggleSidebar } = useOutletContext();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "updatedAt", direction: "desc" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesService.getAll();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(term) ||
        (company.industry || "").toLowerCase().includes(term) ||
        (company.address || "").toLowerCase().includes(term)
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
      if (field === "lastActivityDate" || field === "createdAt" || field === "updatedAt") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
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
  }, [companies, searchTerm, sortConfig]);

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleAddCompany = async (companyData) => {
    try {
      const newCompany = await companiesService.create(companyData);
      setCompanies(prev => [newCompany, ...prev]);
    } catch (error) {
      console.error("Failed to add company:", error);
      throw error;
    }
  };

  const handleCompanyClick = (company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Companies" onMenuClick={toggleSidebar} />
        <div className="p-6">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header title="Companies" onMenuClick={toggleSidebar} />
        <div className="p-6">
          <Error message={error} onRetry={loadCompanies} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <Header
        title="Companies"
        onMenuClick={toggleSidebar}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
        buttonText="Add Company"
      />

      <div className="p-6">
        <CompanyTable
          companies={filteredAndSortedCompanies}
          onCompanyClick={handleCompanyClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCompany}
      />

      <CompanyDetailModal
        company={selectedCompany}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCompany(null);
        }}
      />
    </div>
  );
};

export default CompaniesPage;