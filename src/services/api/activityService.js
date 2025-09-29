import activitiesData from "@/services/mockData/activities.json";

class ActivityService {
  constructor() {
    this.activities = [...activitiesData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }

  async getAll() {
    await this.delay();
    return [...this.activities];
  }

  async getById(id) {
    await this.delay();
    const activity = this.activities.find(a => a.Id === id);
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  }

async create(activityData) {
    await this.delay();
    const newActivity = {
      ...activityData,
      Id: Math.max(...this.activities.map(a => a.Id)) + 1,
      createdAt: new Date().toISOString()
    };
    this.activities.push(newActivity);
    
    // Sync to CompanyHub tests1 table
    try {
      const { ApperClient } = window.APPerSDK || window.ApperSDK || {};
      if (ApperClient) {
        const apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });

        const syncResult = await apperClient.functions.invoke(
          import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB,
          {
            body: JSON.stringify({ activity: newActivity }),
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (syncResult.success) {
          // Import toast dynamically to avoid circular dependencies
          const { toast } = await import('react-toastify');
          toast.success('Activity created and synced to CompanyHub successfully');
        } else {
          console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB}. The response body is: ${JSON.stringify(syncResult)}.`);
          const { toast } = await import('react-toastify');
          toast.warning('Activity created locally, but sync to CompanyHub failed');
        }
      }
    } catch (error) {
      console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SYNC_ACTIVITY_TO_COMPANYHUB}. The error is: ${error.message}`);
      const { toast } = await import('react-toastify');
      toast.warning('Activity created locally, but sync to CompanyHub failed');
    }
    
    return { ...newActivity };
  }

  async update(id, activityData) {
    await this.delay();
    const index = this.activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    this.activities[index] = {
      ...this.activities[index],
      ...activityData
    };
    return { ...this.activities[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.activities.findIndex(a => a.Id === id);
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    const deletedActivity = this.activities.splice(index, 1)[0];
    return { ...deletedActivity };
  }

  async getByContactId(contactId) {
    await this.delay();
    return this.activities.filter(a => a.contactId === contactId).map(a => ({ ...a }));
  }

  async getByDealId(dealId) {
    await this.delay();
    return this.activities.filter(a => a.dealId === dealId).map(a => ({ ...a }));
  }

  async getByType(type) {
    await this.delay();
    return this.activities.filter(a => a.type.toLowerCase() === type.toLowerCase()).map(a => ({ ...a }));
  }
}

export const activityService = new ActivityService();