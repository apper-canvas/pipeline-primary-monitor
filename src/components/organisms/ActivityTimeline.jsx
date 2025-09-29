import { format, isToday, isYesterday } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const ActivityTimeline = ({ activities, loading }) => {
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "call": return "Phone";
      case "email": return "Mail";
      case "meeting": return "Calendar";
      case "note": return "FileText";
      default: return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type.toLowerCase()) {
      case "call": return "primary";
      case "email": return "warning";
      case "meeting": return "success";
      case "note": return "default";
      default: return "default";
    }
  };

  const formatDate = (date) => {
    const activityDate = new Date(date);
    if (isToday(activityDate)) {
      return `Today at ${format(activityDate, "h:mm a")}`;
    } else if (isYesterday(activityDate)) {
      return `Yesterday at ${format(activityDate, "h:mm a")}`;
    } else {
      return format(activityDate, "MMM dd, yyyy 'at' h:mm a");
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ApperIcon name="Activity" className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Activities Yet</h3>
        <p className="text-slate-500">Start logging your customer interactions to see them here.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => (
            <li key={activity.Id}>
              <div className="relative pb-8">
                {index !== activities.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-8 ring-white">
                      <ApperIcon
                        name={getActivityIcon(activity.type)}
                        className="h-4 w-4 text-primary-600"
                      />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActivityColor(activity.type)} size="sm">
                          {activity.type}
                        </Badge>
                        <p className="text-sm text-slate-500">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <h4 className="text-sm font-medium text-slate-900 mt-1">
                        {activity.subject}
                      </h4>
                      {activity.notes && (
                        <p className="text-sm text-slate-600 mt-2">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default ActivityTimeline;