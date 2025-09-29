import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import ActivityTimeline from "@/components/organisms/ActivityTimeline";
import FilterSelect from "@/components/molecules/FilterSelect";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";
import { contactService } from "@/services/api/contactService";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [contactFilter, setContactFilter] = useState("");
  const [formData, setFormData] = useState({
    type: "Note",
    contactId: "",
    subject: "",
    notes: ""
  });

  const activityTypes = [
    { label: "Call", value: "Call" },
    { label: "Email", value: "Email" },
    { label: "Meeting", value: "Meeting" },
    { label: "Note", value: "Note" }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, typeFilter, contactFilter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [activitiesData, contactsData] = await Promise.all([
        activityService.getAll(),
        contactService.getAll()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = [...activities];

    if (typeFilter) {
      filtered = filtered.filter(activity => 
        activity.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (contactFilter) {
      filtered = filtered.filter(activity => 
        activity.contactId === parseInt(contactFilter)
      );
    }

    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredActivities(filtered);
  };

  const handleAddActivity = () => {
    setIsAddingActivity(true);
  };

  const handleCancelAdd = () => {
    setIsAddingActivity(false);
    setFormData({
      type: "Note",
      contactId: "",
      subject: "",
      notes: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.contactId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const activityData = {
        ...formData,
        contactId: parseInt(formData.contactId),
        date: new Date().toISOString()
      };

      await activityService.create(activityData);
      toast.success("Activity logged successfully");
      setIsAddingActivity(false);
      setFormData({
        type: "Note",
        contactId: "",
        subject: "",
        notes: ""
      });
      await loadData();
    } catch (error) {
      toast.error("Failed to log activity");
    }
  };

  const getContactOptions = () => {
    return contacts.map(contact => ({
      value: contact.Id.toString(),
      label: `${contact.firstName} ${contact.lastName} - ${contact.company}`
    }));
  };

  const getActivityStats = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const thisMonthActivities = activities.filter(activity => 
      new Date(activity.date) >= thisMonth
    );

    const byType = activityTypes.reduce((acc, type) => {
      acc[type.value] = thisMonthActivities.filter(activity => 
        activity.type === type.value
      ).length;
      return acc;
    }, {});

    return {
      total: thisMonthActivities.length,
      byType
    };
  };

  if (loading) {
    return (
      <div>
        <Header title="Activities" />
        <div className="p-6">
          <Loading message="Loading activities..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Activities" />
        <div className="p-6">
          <Error 
            title="Failed to Load Activities"
            message={error}
            onRetry={loadData}
          />
        </div>
      </div>
    );
  }

  const stats = getActivityStats();

  return (
    <div>
      <Header 
        title="Activities"
        actions={
          <Button onClick={handleAddActivity} icon="Plus">
            Log Activity
          </Button>
        }
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">This Month</p>
            </div>
          </Card>
          {activityTypes.map(type => (
            <Card key={type.value} className="p-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-slate-900">{stats.byType[type.value] || 0}</p>
                <p className="text-sm text-slate-600">{type.label}s</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Activity Form */}
        {isAddingActivity && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Log New Activity</h3>
              <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterSelect
                  label="Activity Type"
                  options={activityTypes}
                  value={formData.type}
                  onChange={(value) => handleSelectChange("type", value)}
                />
                <FilterSelect
                  label="Contact"
                  options={getContactOptions()}
                  value={formData.contactId}
                  onChange={(value) => handleSelectChange("contactId", value)}
                  placeholder="Select a contact"
                />
              </div>
              
              <FormField
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter activity subject"
                required
              />
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-input resize-none"
                  placeholder="Additional details about this activity..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="secondary" onClick={handleCancelAdd}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Activity
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="w-48">
            <FilterSelect
              placeholder="Filter by type"
              options={activityTypes}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
          <div className="w-64">
            <FilterSelect
              placeholder="Filter by contact"
              options={getContactOptions()}
              value={contactFilter}
              onChange={setContactFilter}
            />
          </div>
          <div className="text-sm text-slate-600">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
        </div>

        {/* Activity Timeline */}
        {filteredActivities.length > 0 ? (
          <ActivityTimeline activities={filteredActivities} />
        ) : (
          <Empty
            title="No activities found"
            message={typeFilter || contactFilter 
              ? "Try adjusting your filters to find activities."
              : "Start tracking your customer interactions by logging your first activity."
            }
            icon="Activity"
            actionLabel={!typeFilter && !contactFilter ? "Log First Activity" : undefined}
            onAction={!typeFilter && !contactFilter ? handleAddActivity : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default Activities;