import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import FilterSelect from "@/components/molecules/FilterSelect";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";

const Reports = () => {
  const [data, setData] = useState({
    deals: [],
    contacts: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30");

  const timeRangeOptions = [
    { label: "Last 30 Days", value: "30" },
    { label: "Last 60 Days", value: "60" },
    { label: "Last 90 Days", value: "90" },
    { label: "This Year", value: "365" }
  ];

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [deals, contacts, activities] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
        activityService.getAll()
      ]);

      setData({ deals, contacts, activities });
    } catch (err) {
      setError("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return {
deals: data.deals.filter(deal => new Date(deal.CreatedOn) >= cutoffDate),
      contacts: data.contacts.filter(contact => new Date(contact.CreatedOn) >= cutoffDate),
      activities: data.activities.filter(activity => new Date(activity.date_c) >= cutoffDate)
    };
  };

  const getKeyMetrics = () => {
    const filtered = getFilteredData();
    const totalDeals = filtered.deals.length;
const totalValue = filtered.deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
    const closedDeals = filtered.deals.filter(deal => deal.stage_c?.toLowerCase() === "closed");
    const closedValue = closedDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
    const winRate = totalDeals > 0 ? Math.round((closedDeals.length / totalDeals) * 100) : 0;
    const avgDealSize = closedDeals.length > 0 ? Math.round(closedValue / closedDeals.length) : 0;

    return {
      totalContacts: filtered.contacts.length,
      totalDeals,
      totalValue,
      closedValue,
      winRate,
      avgDealSize,
      totalActivities: filtered.activities.length
    };
  };

  const getPipelineData = () => {
    const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];
    const filtered = getFilteredData();
    
    const stageData = stages.map(stage => {
const stageDeals = filtered.deals.filter(deal => deal.stage_c === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      };
    });

    return {
      series: [{
        name: "Deal Count",
        data: stageData.map(item => item.count)
      }],
      options: {
        chart: {
          type: "bar",
          height: 350,
          toolbar: { show: false }
        },
        colors: ["#2563eb"],
        xaxis: {
          categories: stages
        },
        yaxis: {
          title: { text: "Number of Deals" }
        },
        title: {
          text: "Deals by Stage",
          style: { fontFamily: "Inter" }
        }
      }
    };
  };

  const getActivityData = () => {
    const filtered = getFilteredData();
    const activityCounts = {
      Call: 0,
      Email: 0,
      Meeting: 0,
      Note: 0
    };

    filtered.activities.forEach(activity => {
if (activityCounts.hasOwnProperty(activity.type_c)) {
        activityCounts[activity.type_c]++;
      }
    });

    return {
      series: Object.values(activityCounts),
      options: {
        chart: {
          type: "donut",
          height: 350
        },
        colors: ["#2563eb", "#10b981", "#f59e0b", "#6b7280"],
        labels: Object.keys(activityCounts),
        title: {
          text: "Activity Distribution",
          style: { fontFamily: "Inter" }
        },
        legend: {
          position: "bottom"
        }
      }
    };
  };

  const getMonthlyTrendData = () => {
    const months = [];
    const dealValues = [];
    const dealCounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleString("default", { month: "short" });
      months.push(monthStr);
      
      const monthDeals = data.deals.filter(deal => {
const dealDate = new Date(deal.CreatedOn);
        return dealDate.getMonth() === date.getMonth() && dealDate.getFullYear() === date.getFullYear();
      });

      dealCounts.push(monthDeals.length);
      dealValues.push(monthDeals.reduce((sum, deal) => sum + (deal.value_c || 0), 0));
    }

    return {
      series: [
        {
          name: "Deal Value",
          type: "column",
          data: dealValues
        },
        {
          name: "Deal Count",
          type: "line",
          data: dealCounts
        }
      ],
      options: {
        chart: {
          height: 350,
          type: "line",
          toolbar: { show: false }
        },
        colors: ["#2563eb", "#10b981"],
        stroke: {
          width: [0, 2]
        },
        xaxis: {
          categories: months
        },
        yaxis: [
          {
            title: { text: "Deal Value ($)" },
            labels: {
              formatter: (value) => `$${(value / 1000).toFixed(0)}K`
            }
          },
          {
            opposite: true,
            title: { text: "Deal Count" }
          }
        ],
        title: {
          text: "Monthly Trends",
          style: { fontFamily: "Inter" }
        }
      }
    };
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
      <div>
        <Header title="Reports" />
        <div className="p-6">
          <Loading message="Loading reports..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Reports" />
        <div className="p-6">
          <Error 
            title="Failed to Load Reports"
            message={error}
            onRetry={loadReportsData}
          />
        </div>
      </div>
    );
  }

  const metrics = getKeyMetrics();
  const pipelineChart = getPipelineData();
  const activityChart = getActivityData();
  const trendChart = getMonthlyTrendData();

  return (
    <div>
      <Header 
        title="Reports & Analytics"
        actions={
          <div className="w-48">
            <FilterSelect
              options={timeRangeOptions}
              value={timeRange}
              onChange={setTimeRange}
              placeholder="Select time range"
            />
          </div>
        }
      />

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="New Contacts"
            value={metrics.totalContacts.toLocaleString()}
            icon="Users"
            trend="up"
            trendValue="+12% vs previous period"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(metrics.totalValue)}
            icon="DollarSign"
            trend="up"
            trendValue="+15% vs previous period"
          />
          <StatCard
            title="Closed Revenue"
            value={formatCurrency(metrics.closedValue)}
            icon="TrendingUp"
            trend="up"
            trendValue="+8% vs previous period"
          />
          <StatCard
            title="Win Rate"
            value={`${metrics.winRate}%`}
            icon="Target"
            trend={metrics.winRate >= 50 ? "up" : "down"}
            trendValue={`${metrics.winRate >= 50 ? '+' : '-'}3% vs previous period`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pipeline Chart */}
          <Card className="p-6">
            <Chart
              options={pipelineChart.options}
              series={pipelineChart.series}
              type="bar"
              height={350}
            />
          </Card>

          {/* Activity Chart */}
          <Card className="p-6">
            <Chart
              options={activityChart.options}
              series={activityChart.series}
              type="donut"
              height={350}
            />
          </Card>
        </div>

        {/* Trend Chart */}
        <Card className="p-6 mb-8">
          <Chart
            options={trendChart.options}
            series={trendChart.series}
            type="line"
            height={350}
          />
        </Card>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Average Deal Size</span>
                <span className="font-semibold">{formatCurrency(metrics.avgDealSize)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Activities</span>
                <span className="font-semibold">{metrics.totalActivities}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Active Deals</span>
                <span className="font-semibold">{metrics.totalDeals}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversion Rates</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Lead to Qualified</span>
                <span className="font-semibold text-emerald-600">65%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Qualified to Proposal</span>
                <span className="font-semibold text-emerald-600">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Proposal to Closed</span>
                <span className="font-semibold text-emerald-600">{metrics.winRate}%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Growth Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Revenue Growth</span>
                <span className="font-semibold text-emerald-600">+15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Contact Growth</span>
                <span className="font-semibold text-emerald-600">+12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Activity Growth</span>
                <span className="font-semibold text-emerald-600">+8%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;