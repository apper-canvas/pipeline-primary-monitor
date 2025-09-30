import { toast } from 'react-toastify';

class ContactService {
  constructor() {
    this.tableName = 'contact_c';
    this.apperClient = null;
  }

  getApperClient() {
    if (!this.apperClient) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return this.apperClient;
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch contacts:", response?.message);
        toast.error(response?.message || "Failed to fetch contacts");
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      toast.error("Failed to load contacts");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "position_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };

      const response = await this.getApperClient().getRecordById(this.tableName, id, params);
      
      if (!response?.success) {
        console.error(`Failed to fetch contact ${id}:`, response?.message);
        toast.error(response?.message || "Contact not found");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load contact");
      return null;
    }
  }

  async create(contactData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: contactData.Name || `${contactData.first_name_c || ''} ${contactData.last_name_c || ''}`.trim(),
          Tags: contactData.Tags || '',
          first_name_c: contactData.first_name_c,
          last_name_c: contactData.last_name_c,
          email_c: contactData.email_c,
          phone_c: contactData.phone_c,
          company_c: contactData.company_c,
          position_c: contactData.position_c,
          notes_c: contactData.notes_c
        }]
      };

      const response = await this.getApperClient().createRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to create contact:", response?.message);
        toast.error(response?.message || "Failed to create contact");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const newContact = successful[0].data;
          toast.success('Contact created successfully!');
          
          // Create Stripe customer after successful database creation
          try {
            if (typeof window !== 'undefined' && window.ApperSDK) {
              const createResult = await this.getApperClient().functions.invoke(import.meta.env.VITE_CREATE_STRIPE_CUSTOMER, {
                body: JSON.stringify({ contact: newContact }),
                headers: {
                  'Content-Type': 'application/json'
                }
              });

              const createData = await createResult.json();
              
              if (createData.success) {
                toast.success('Stripe customer created successfully!');
              } else {
                console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The response body is: ${JSON.stringify(createData)}.`);
                toast.warning('Contact created, but Stripe customer creation failed.');
              }
            }
          } catch (error) {
            console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_CREATE_STRIPE_CUSTOMER}. The error is: ${error.message}`);
            toast.warning('Contact created, but Stripe customer creation is unavailable.');
          }
          
          return newContact;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      toast.error("Failed to create contact");
      return null;
    }
  }

  async update(id, contactData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: id,
          Name: contactData.Name || `${contactData.first_name_c || ''} ${contactData.last_name_c || ''}`.trim(),
          Tags: contactData.Tags || '',
          first_name_c: contactData.first_name_c,
          last_name_c: contactData.last_name_c,
          email_c: contactData.email_c,
          phone_c: contactData.phone_c,
          company_c: contactData.company_c,
          position_c: contactData.position_c,
          notes_c: contactData.notes_c
        }]
      };

      const response = await this.getApperClient().updateRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to update contact:", response?.message);
        toast.error(response?.message || "Failed to update contact");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Contact updated successfully!');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
      toast.error("Failed to update contact");
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [id]
      };

      const response = await this.getApperClient().deleteRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to delete contact:", response?.message);
        toast.error(response?.message || "Failed to delete contact");
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Contact deleted successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      toast.error("Failed to delete contact");
      return false;
    }
  }
}

export const contactService = new ContactService();

export const contactService = new ContactService();