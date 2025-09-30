import React, { useState } from "react";
import { format, isValid } from "date-fns";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const DealCard = ({ 
  deal,
  onStageChange,
  onClick,
  className,
  draggable = false,
  ...props
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  };

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case "lead": return "default";
      case "qualified": return "primary";
      case "proposal": return "warning";
      case "negotiation": return "warning";
      case "closed": return "success";
      default: return "default";
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", deal.Id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={cn(
        `pipeline-card stage-${deal.stage.toLowerCase()}`,
        isDragging && "opacity-50 transform rotate-1",
        className
      )}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick && onClick(deal)}
      {...props}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-slate-900 line-clamp-2">{deal.title}</h4>
          <ApperIcon name="MoreHorizontal" className="h-4 w-4 text-slate-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant={getStageColor(deal.stage)} size="sm">
              {deal.stage}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-slate-600">
            <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
<span>Close: {deal.expectedCloseDate && isValid(new Date(deal.expectedCloseDate))
              ? format(new Date(deal.expectedCloseDate), "MMM dd")
              : "Invalid date"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-600">
              <ApperIcon name="TrendingUp" className="h-4 w-4 mr-1" />
              <span>{deal.probability}% probability</span>
            </div>
          </div>
        </div>
        
        {deal.notes && (
          <p className="text-sm text-slate-600 line-clamp-2">{deal.notes}</p>
        )}
      </div>
    </Card>
  );
};

export default DealCard;