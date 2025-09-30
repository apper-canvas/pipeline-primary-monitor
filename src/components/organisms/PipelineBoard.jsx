import { useState } from "react";
import Card from "@/components/atoms/Card";
import DealCard from "@/components/molecules/DealCard";
import ApperIcon from "@/components/ApperIcon";

const PipelineBoard = ({ deals, stages, onStageChange, onDealClick }) => {
  const [draggedDeal, setDraggedDeal] = useState(null);

const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage && deal.stage.toLowerCase() === stage.toLowerCase());
  };

  const getStageTotal = (stage) => {
    const stageDeals = getDealsByStage(stage);
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("text/plain");
    if (dealId && onStageChange) {
      onStageChange(parseInt(dealId), targetStage);
    }
    setDraggedDeal(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 h-full">
      {stages.map((stage) => {
        const stageDeals = getDealsByStage(stage);
        const stageTotal = getStageTotal(stage);
        
        return (
          <div
            key={stage}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <Card className="p-4 mb-4 bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{stage}</h3>
                <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">
                  {stageDeals.length}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-600">
                {formatCurrency(stageTotal)}
              </p>
            </Card>
            
            <div className="flex-1 space-y-3 min-h-[400px]">
              {stageDeals.length > 0 ? (
                stageDeals.map((deal) => (
                  <DealCard
                    key={deal.Id}
                    deal={deal}
                    draggable
                    onClick={onDealClick}
                    onStageChange={onStageChange}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                  <ApperIcon name="Plus" className="h-8 w-8 mb-2" />
                  <p className="text-sm">Drop deals here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineBoard;