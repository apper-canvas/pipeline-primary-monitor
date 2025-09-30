import { toast } from 'react-toastify';

class ActivityService {
  constructor() {
    this.tableName = 'activity_c';
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch activities:", response?.message);
        toast.error(response?.message || "Failed to fetch activities");
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      toast.error("Failed to load activities");
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
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ]
      };

      const response = await this.getApperClient().getRecordById(this.tableName, id, params);
      
      if (!response?.success) {
        console.error(`Failed to fetch activity ${id}:`, response?.message);
        toast.error(response?.message || "Activity not found");
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load activity");
      return null;
    }
  }

  async create(activityData) {
    try {
      // Only include Updateable fields, convert lookup fields to integers
      const params = {
        records: [{
          Name: activityData.Name || activityData.subject_c,
          Tags: activityData.Tags || '',
          type_c: activityData.type_c,
          subject_c: activityData.subject_c,
          notes_c: activityData.notes_c,
          date_c: activityData.date_c,
          contact_id_c: activityData.contact_id_c ? parseInt(activityData.contact_id_c) : null,
          deal_id_c: activityData.deal_id_c ? parseInt(activityData.deal_id_c) : null
        }]
      };

      // Remove null values
      Object.keys(params.records[0]).forEach(key => {
        if (params.records[0][key] === null || params.records[0][key] === undefined || params.records[0][key] === '') {
          delete params.records[0][key];
        }
      });

      const response = await this.getApperClient().createRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to create activity:", response?.message);
        toast.error(response?.message || "Failed to create activity");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          const newActivity = successful[0].data;
          toast.success('Activity created successfully!');
          
          // Sync to CompanyHub after successful database creation
          try {
            const syncResult = await this.getApperClient().functions.invoke(
              import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB,
              {
                body: JSON.stringify({ activity: newActivity }),
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            if (syncResult.success) {
              toast.success('Activity synced to CompanyHub successfully');
            } else {
              console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB}. The response body is: ${JSON.stringify(syncResult)}.`);
              toast.warning('Activity created, but sync to CompanyHub failed');
            }
          } catch (error) {
            console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB}. The error is: ${error.message}`);
            toast.warning('Activity created, but CompanyHub sync is unavailable');
          }
          
          return newActivity;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      toast.error("Failed to create activity");
      return null;
    }
  }

  async update(id, activityData) {
    try {
      // Only include Updateable fields, convert lookup fields to integers
      const params = {
        records: [{
          Id: id,
          Name: activityData.Name || activityData.subject_c,
          Tags: activityData.Tags || '',
          type_c: activityData.type_c,
          subject_c: activityData.subject_c,
          notes_c: activityData.notes_c,
          date_c: activityData.date_c,
          contact_id_c: activityData.contact_id_c ? parseInt(activityData.contact_id_c) : null,
          deal_id_c: activityData.deal_id_c ? parseInt(activityData.deal_id_c) : null
        }]
      };

      // Remove null values
      Object.keys(params.records[0]).forEach(key => {
        if (params.records[0][key] === null || params.records[0][key] === undefined || params.records[0][key] === '') {
          delete params.records[0][key];
        }
      });

      const response = await this.getApperClient().updateRecord(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to update activity:", response?.message);
        toast.error(response?.message || "Failed to update activity");
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Activity updated successfully!');
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      toast.error("Failed to update activity");
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
        console.error("Failed to delete activity:", response?.message);
        toast.error(response?.message || "Failed to delete activity");
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Activity deleted successfully!');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting activity:", error?.response?.data?.message || error);
      toast.error("Failed to delete activity");
      return false;
    }
  }

  async getByContactId(contactId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "contact_id_c", "Operator": "EqualTo", "Values": [parseInt(contactId)]}],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch activities by contact:", response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by contact:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByDealId(dealId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "deal_id_c", "Operator": "EqualTo", "Values": [parseInt(dealId)]}],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch activities by deal:", response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by deal:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByType(type) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}}
        ],
        where: [{"FieldName": "type_c", "Operator": "EqualTo", "Values": [type]}],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.getApperClient().fetchRecords(this.tableName, params);
      
      if (!response?.success) {
        console.error("Failed to fetch activities by type:", response?.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by type:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
