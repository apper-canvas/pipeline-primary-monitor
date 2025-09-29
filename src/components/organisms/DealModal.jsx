import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import FilterSelect from "@/components/molecules/FilterSelect";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";

const DealModal = ({ deal, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    contactId: "",
    value: "",
    stage: "Lead",
    probability: "25",
    expectedCloseDate: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});

  const stages = [
    { label: "Lead", value: "Lead" },
    { label: "Qualified", value: "Qualified" },
    { label: "Proposal", value: "Proposal" },
    { label: "Negotiation", value: "Negotiation" },
    { label: "Closed", value: "Closed" }
  ];

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        contactId: deal.contactId || "",
        value: deal.value?.toString() || "",
        stage: deal.stage || "Lead",
        probability: deal.probability?.toString() || "25",
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : "",
        notes: deal.notes || ""
      });
    } else {
      setFormData({
        title: "",
        contactId: "",
        value: "",
        stage: "Lead",
        probability: "25",
        expectedCloseDate: "",
        notes: ""
      });
    }
    setErrors({});
  }, [deal, isOpen]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error("Failed to load contacts");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required";
    }
    if (!formData.contactId) {
      newErrors.contactId = "Contact is required";
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Valid deal value is required";
    }
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "Expected close date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        contactId: parseInt(formData.contactId)
      };

      if (deal) {
        await dealService.update(deal.Id, dealData);
        toast.success("Deal updated successfully");
      } else {
        await dealService.create(dealData);
        toast.success("Deal created successfully");
      }
      onSave();
      onClose();
    } catch (error) {
      toast.error("Failed to save deal");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const contactOptions = contacts.map(contact => ({
    value: contact.Id.toString(),
    label: `${contact.firstName} ${contact.lastName} - ${contact.company}`
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {deal ? "Edit Deal" : "Add New Deal"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Deal Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
            required
            placeholder="Enter deal title"
          />

          <FilterSelect
            label="Contact"
            options={contactOptions}
            value={formData.contactId}
            onChange={(value) => handleSelectChange("contactId", value)}
            placeholder="Select a contact"
          />
          {errors.contactId && (
            <p className="text-sm text-red-600">{errors.contactId}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Deal Value"
              name="value"
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={handleInputChange}
              error={errors.value}
              required
              placeholder="0.00"
            />
            <div>
              <FilterSelect
                label="Stage"
                options={stages}
                value={formData.stage}
                onChange={(value) => handleSelectChange("stage", value)}
                placeholder="Select stage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Probability (%)"
              name="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={handleInputChange}
              placeholder="25"
            />
            <FormField
              label="Expected Close Date"
              name="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={handleInputChange}
              error={errors.expectedCloseDate}
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleInputChange}
              className="form-input resize-none"
              placeholder="Additional notes about this deal..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {deal ? "Update Deal" : "Create Deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealModal;