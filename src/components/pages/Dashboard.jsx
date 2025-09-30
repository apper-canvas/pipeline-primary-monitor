import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import ActivityTimeline from "@/components/organisms/ActivityTimeline";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";

const Dashboard = () => {
  const [data, setData] = useState({
    contacts: [],
    deals: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [contacts, deals, activities] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      setData({ contacts, deals, activities });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalDeals = data.deals.length;
const totalValue = data.deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
    const closedDeals = data.deals.filter(deal => deal.stage_c?.toLowerCase() === "closed").length;
    const winRate = totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 0;
    
    return {
      totalContacts: data.contacts.length,
      totalDeals,
      totalValue,
      winRate
    };
  };

  const getRecentActivities = () => {
return data.activities
      .sort((a, b) => new Date(b.date_c) - new Date(a.date_c))
      .slice(0, 5);
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return data.deals.filter(deal => {
const closeDate = new Date(deal.expected_close_date_c);
      return closeDate >= today && closeDate <= nextWeek && deal.stage_c?.toLowerCase() !== "closed";
    }).slice(0, 5);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Header title="Dashboard" />
        <Loading message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Header title="Dashboard" />
        <Error 
          title="Failed to Load Dashboard"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const stats = getStats();
  const recentActivities = getRecentActivities();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div>
      <Header title="Dashboard" />
      
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Contacts"
            value={stats.totalContacts.toLocaleString()}
            icon="Users"
            trend="up"
            trendValue="+12% from last month"
          />
          <StatCard
            title="Active Deals"
            value={stats.totalDeals.toLocaleString()}
            icon="GitBranch"
            trend="up"
            trendValue="+8% from last month"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(stats.totalValue)}
            icon="DollarSign"
            trend="up"
            trendValue="+15% from last month"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate}%`}
            icon="TrendingUp"
            trend={stats.winRate >= 50 ? "up" : "down"}
            trendValue={`${stats.winRate >= 50 ? '+' : '-'}3% from last month`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
              <Button variant="ghost" size="sm" icon="ArrowRight">
                View All
              </Button>
            </div>
            <ActivityTimeline activities={recentActivities} />
          </div>

          {/* Upcoming Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Upcoming Deal Closures</h2>
              <Button variant="ghost" size="sm" icon="ArrowRight">
                View Pipeline
              </Button>
            </div>
            <Card className="p-6">
              {upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTasks.map((deal) => (
<div key={deal.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">{deal.title_c}</h4>
                        <p className="text-sm text-slate-600">
                          Value: {formatCurrency(deal.value)} • {deal.probability}% probability
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-600">
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">{deal.stage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="Calendar" className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No upcoming deal closures</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;