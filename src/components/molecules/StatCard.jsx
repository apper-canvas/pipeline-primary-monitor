import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title,
  value,
  icon,
  trend,
  trendValue,
  className,
  ...props
}) => {
  const isPositiveTrend = trend === "up";
  
  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
          {trendValue && (
            <div className={cn(
              "flex items-center mt-2 text-sm",
              isPositiveTrend ? "text-emerald-600" : "text-red-600"
            )}>
              <ApperIcon 
                name={isPositiveTrend ? "TrendingUp" : "TrendingDown"} 
                className="h-4 w-4 mr-1" 
              />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} className="h-6 w-6 text-primary-600" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;