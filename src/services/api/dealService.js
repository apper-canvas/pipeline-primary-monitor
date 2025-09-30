import { toast } from 'react-toastify';

class DealService {
  constructor() {
    this.tableName = 'deal_c';
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch deals:", response?.message);
        toast.error(response?.message || "Failed to fetch deals");
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      toast.error("Failed to load deals");
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ]
      };

      const response = await this.getApperClient().getRecordById(this.tableName, id, params);
      
      if (!response?.success) {
        console.error(`Failed to fetch deal ${id}:`, response?.message);
        toast.error(response?.message || "Deal not found");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load deal");
      return null;
    }
  }

  async create(dealData) {
    try {
      // Only include Updateable fields, convert lookup field to integer
      const params = {
        records: [{
          Name: dealData.Name || dealData.title_c,
          Tags: dealData.Tags || '',
          title_c: dealData.title_c,
          value_c: parseFloat(dealData.value_c),
          stage_c: dealData.stage_c,
          probability_c: parseInt(dealData.probability_c),
          expected_close_date_c: dealData.expected_close_date_c,
          notes_c: dealData.notes_c,
          contact_id_c: parseInt(dealData.contact_id_c)
        }]
      };

      const response = await this.getApperClient().createRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to create deal:", response?.message);
        toast.error(response?.message || "Failed to create deal");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Deal created successfully!');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      toast.error("Failed to create deal");
      return null;
    }
  }

  async update(id, dealData) {
    try {
      // Only include Updateable fields, convert lookup field to integer
      const params = {
        records: [{
          Id: id,
          Name: dealData.Name || dealData.title_c,
          Tags: dealData.Tags || '',
          title_c: dealData.title_c,
          value_c: parseFloat(dealData.value_c),
          stage_c: dealData.stage_c,
          probability_c: parseInt(dealData.probability_c),
          expected_close_date_c: dealData.expected_close_date_c,
          notes_c: dealData.notes_c,
          contact_id_c: parseInt(dealData.contact_id_c)
        }]
      };

      const response = await this.getApperClient().updateRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to update deal:", response?.message);
        toast.error(response?.message || "Failed to update deal");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Deal updated successfully!');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      toast.error("Failed to update deal");
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
        console.error("Failed to delete deal:", response?.message);
        toast.error(response?.message || "Failed to delete deal");
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Deal deleted successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      toast.error("Failed to delete deal");
      return false;
    }
  }

  async getByContactId(contactId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ],
        where: [{"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch deals by contact:", response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by contact:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByStage(stage) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "contact_id_c"}}
        ],
        where: [{"FieldName": "stage_c", "Operator": "EqualTo", "Values": [stage]}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch deals by stage:", response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by stage:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export const dealService = new DealService();

export const dealService = new DealService();