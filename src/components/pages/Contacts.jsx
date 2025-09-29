import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import ContactTable from "@/components/organisms/ContactTable";
import ContactModal from "@/components/organisms/ContactModal";
import FilterSelect from "@/components/molecules/FilterSelect";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { contactService } from "@/services/api/contactService";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, companyFilter]);

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search)
      );
    }

    // Company filter
    if (companyFilter) {
      filtered = filtered.filter(contact =>
        contact.company.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleViewContact = (contact) => {
    // In a real app, this would navigate to a detail page
    toast.info(`Viewing ${contact.firstName} ${contact.lastName}`);
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await contactService.delete(contactId);
        toast.success("Contact deleted successfully");
        await loadContacts();
      } catch (error) {
        toast.error("Failed to delete contact");
      }
    }
  };

  const handleModalSave = async () => {
    await loadContacts();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getCompanyOptions = () => {
    const companies = [...new Set(contacts.map(contact => contact.company))];
    return companies.map(company => ({ label: company, value: company }));
  };

  if (loading) {
    return (
      <div>
        <Header title="Contacts" />
        <div className="p-6">
          <Loading message="Loading contacts..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Contacts" />
        <div className="p-6">
          <Error 
            title="Failed to Load Contacts"
            message={error}
            onRetry={loadContacts}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Contacts"
        onSearch={handleSearch}
        actions={
          <Button onClick={handleAddContact} icon="Plus">
            Add Contact
          </Button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="w-64">
            <FilterSelect
              placeholder="Filter by company"
              options={getCompanyOptions()}
              value={companyFilter}
              onChange={setCompanyFilter}
            />
          </div>
          <div className="text-sm text-slate-600">
            Showing {filteredContacts.length} of {contacts.length} contacts
          </div>
        </div>

        {/* Contact Table */}
        {filteredContacts.length > 0 ? (
          <ContactTable
            contacts={filteredContacts}
            onEdit={handleEditContact}
            onView={handleViewContact}
            onDelete={handleDeleteContact}
            loading={loading}
          />
        ) : (
          <Empty
            title="No contacts found"
            message={searchTerm || companyFilter 
              ? "Try adjusting your search or filters to find contacts."
              : "Start building your network by adding your first contact."
            }
            icon="Users"
            actionLabel={!searchTerm && !companyFilter ? "Add First Contact" : undefined}
            onAction={!searchTerm && !companyFilter ? handleAddContact : undefined}
          />
        )}

        {/* Contact Modal */}
        <ContactModal
          contact={selectedContact}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      </div>
    </div>
  );
};

export default Contacts;