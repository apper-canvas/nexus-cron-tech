import React, { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { contactService } from "@/services/api/contactService";
import { cn } from "@/utils/cn";
import AddContactModal from "@/components/organisms/AddContactModal";
import ContactTable from "@/components/organisms/ContactTable";
import ContactDetailModal from "@/components/organisms/ContactDetailModal";
import Header from "@/components/organisms/Header";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const ContactsPage = () => {
  const { toggleSidebar } = useOutletContext();
  
const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ field: "name", direction: "asc" });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageContacts = filteredContacts.slice(startIndex, endIndex);
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await contactService.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
      console.error("Error loading contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Search functionality
useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
      setCurrentPage(1); // Reset to first page when clearing search
      return;
    }

const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))
    );

    setFilteredContacts(filtered);
    setCurrentPage(1); // Reset to first page when search results change
  }, [searchTerm, contacts]);

  // Sorting functionality
const handleSort = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ field, direction });

    const sorted = [...filteredContacts].sort((a, b) => {
      let aValue = a[field] || "";
      let bValue = b[field] || "";

      // Handle date fields
      if (field === "lastContactDate") {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle string fields
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredContacts(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
  };

  const handleAddContact = async (contactData) => {
    try {
      const newContact = await contactService.create(contactData);
      setContacts(prev => [newContact, ...prev]);
      setFilteredContacts(prev => [newContact, ...prev]);
    } catch (err) {
      console.error("Error adding contact:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header
          title="Contacts"
          onMenuClick={toggleSidebar}
        />
        <div className="p-6">
          <Loading type="table" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-hidden">
        <Header
          title="Contacts"
          onMenuClick={toggleSidebar}
        />
        <div className="p-6">
          <Error message={error} onRetry={loadContacts} />
        </div>
      </div>
    );
  }
return (
<div className="flex-1 overflow-hidden">
      <Header
        title="Contacts"
        onMenuClick={toggleSidebar}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        onAddClick={() => setShowAddModal(true)}
      />
<div className="p-6">
        {contacts.length === 0 ? (
          <Empty
            title="No contacts yet"
            description="Start building your customer database by adding your first contact."
            actionLabel="Add Contact"
            onAction={() => setShowAddModal(true)}
            icon="Users"
          />
        ) : (
          <>
            <ContactTable
              contacts={currentPageContacts}
              onContactClick={handleContactClick}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
            
            {/* Pagination Controls */}
            {filteredContacts.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Pagination Info */}
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of{' '}
                    {filteredContacts.length} contacts
                  </div>
                  
                  {/* Items Per Page Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-slate-600">per page</span>
                  </div>
                </div>
                
                {/* Pagination Navigation */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <nav className="flex items-center gap-1">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                          currentPage === 1
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and adjacent pages
                          return page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, filteredPages) => {
                          const prevPage = filteredPages[index - 1];
                          const showEllipsis = prevPage && page - prevPage > 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsis && (
                                <span className="px-2 text-slate-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                  "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                                  page === currentPage
                                    ? "bg-primary text-white"
                                    : "text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                )}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                      
                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                          currentPage === totalPages
                            ? "text-slate-400 cursor-not-allowed"
                            : "text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        )}
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddContact}
      />
    </div>
  );
};

export default ContactsPage;