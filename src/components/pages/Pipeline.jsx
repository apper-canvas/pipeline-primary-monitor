import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import PipelineBoard from "@/components/organisms/PipelineBoard";
import DealModal from "@/components/organisms/DealModal";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { dealService } from "@/services/api/dealService";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stages = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"];

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError("");
    
    try {
      const data = await dealService.getAll();
      setDeals(data);
    } catch (err) {
      setError("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleStageChange = async (dealId, newStage) => {
    try {
      const deal = deals.find(d => d.Id === dealId);
      if (!deal) return;

      const updatedDeal = { ...deal, stage: newStage };
      await dealService.update(dealId, updatedDeal);
      
      setDeals(prev => prev.map(d => 
d.Id === dealId ? { ...d, stage_c: newStage } : d
      ));
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (error) {
      toast.error("Failed to update deal stage");
    }
  };

  const handleModalSave = async () => {
    await loadDeals();
  };

  const getTotalPipelineValue = () => {
return deals.reduce((sum, deal) => sum + (deal.value_c || 0), 0);
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
        <Header title="Pipeline" />
        <div className="p-6">
          <Loading message="Loading pipeline..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Pipeline" />
        <div className="p-6">
          <Error 
            title="Failed to Load Pipeline"
            message={error}
            onRetry={loadDeals}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Sales Pipeline"
        actions={
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              Total Value: <span className="font-semibold text-slate-900">
                {formatCurrency(getTotalPipelineValue())}
              </span>
            </div>
            <Button onClick={handleAddDeal} icon="Plus">
              Add Deal
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {deals.length > 0 ? (
          <PipelineBoard
            deals={deals}
            stages={stages}
            onStageChange={handleStageChange}
            onDealClick={handleDealClick}
          />
        ) : (
          <Empty
            title="No deals in pipeline"
            message="Start tracking your sales opportunities by adding your first deal."
            icon="GitBranch"
            actionLabel="Add First Deal"
            onAction={handleAddDeal}
          />
        )}

        {/* Deal Modal */}
        <DealModal
          deal={selectedDeal}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      </div>
    </div>
  );
};

export default Pipeline;