import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OpportunityRadar from './components/OpportunityRadar';
import OrderDecisionModal from './components/OrderDecisionModal';
import MissionPlanner from './components/MissionPlanner';
import BurnoutGuardian from './components/BurnoutGuardian';
import ChatFallback from './components/ChatFallback';
import ScreenshotOCR from './components/ScreenshotOCR';
import APISettings from './components/APISettings';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import { api } from './services/api';
import { Zap, ShieldCheck, ArrowRight, Activity, Sparkles, Navigation } from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [burnoutData, setBurnoutData] = useState(null);
  const [missionData, setMissionData] = useState(null);
  const [simulatedOrder, setSimulatedOrder] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  // Initial Data Fetching
  const loadAppData = async () => {
    try {
      const [dash, radar, burnout, mission] = await Promise.all([
        api.getDashboard(),
        api.getRadar(),
        api.getBurnout(),
        api.getMission()
      ]);
      setDashboardData(dash);
      setRadarData(radar);
      setBurnoutData(burnout);
      setMissionData(mission);
    } catch (err) {
      console.error("Failed loading initial data:", err);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Simulate Order Trigger
  const handleSimulateOrder = async () => {
    setIsSimulating(true);
    try {
      const orderResult = await api.simulateOrder();
      setSimulatedOrder(orderResult);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Handle Order Decision (Accept / Reject)
  const handleDecision = async (order, decision, recommendedAction) => {
    const isAccept = decision === 'accepted';
    setSimulatedOrder(null); // Close modal

    // Optimistic local state update
    if (dashboardData) {
      const profit = isAccept ? order.profitEstimate : 0;
      const updatedEarnings = dashboardData.earningsToday + profit;
      const updatedAccepted = dashboardData.ordersAccepted + (isAccept ? 1 : 0);
      const updatedRejected = dashboardData.ordersRejected + (!isAccept ? 1 : 0);
      const updatedHours = Number((dashboardData.hoursActiveToday + 0.25).toFixed(1));

      let { reliability, safety, efficiency, incomeStability, customerHappiness } = dashboardData.gigDNA;
      if (isAccept) {
        efficiency = Math.min(100, efficiency + 2);
        incomeStability = Math.min(100, incomeStability + 1);
        customerHappiness = Math.min(100, customerHappiness + 1);
        if (recommendedAction === 'REJECT') safety = Math.max(0, safety - 4);
      } else {
        if (recommendedAction === 'REJECT') {
          reliability = Math.min(100, reliability + 2);
          safety = Math.min(100, safety + 2);
        } else {
          incomeStability = Math.max(0, incomeStability - 3);
        }
      }

      const compositeScore = Math.round((reliability + safety + efficiency + incomeStability + customerHappiness) / 5);

      setDashboardData({
        ...dashboardData,
        earningsToday: updatedEarnings,
        ordersAccepted: updatedAccepted,
        ordersRejected: updatedRejected,
        hoursActiveToday: updatedHours,
        compositeScore,
        gigDNA: { reliability, safety, efficiency, incomeStability, customerHappiness }
      });
    }

    // Server decision call
    try {
      const serverUpdated = await api.sendDecision(order, decision, recommendedAction);
      if (serverUpdated) {
        setDashboardData(prev => ({ ...prev, ...serverUpdated }));
      }
    } catch (err) {
      console.warn("Backend update error:", err);
    }
  };

  // Landing Page View
  if (showLanding) {
    return (
      <div className="relative">
        <LandingPage
          onLaunchApp={() => setShowLanding(false)}
          onSimulateOrder={() => {
            setShowLanding(false);
            handleSimulateOrder();
          }}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Order Decision Modal if fired from Landing Page */}
        {simulatedOrder && (
          <OrderDecisionModal
            orderData={simulatedOrder}
            onAccept={(ord, rec) => handleDecision(ord, 'accepted', rec)}
            onReject={(ord, rec) => handleDecision(ord, 'rejected', rec)}
            onClose={() => setSimulatedOrder(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <Header
        worker={dashboardData?.worker}
        onSimulateOrder={handleSimulateOrder}
        isSimulating={isSimulating}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
        onGoLanding={() => setShowLanding(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {activeTab === 'dashboard' && (
          <Dashboard
            dashboardData={dashboardData}
            burnoutData={burnoutData}
            missionData={missionData}
            onSimulateOrder={handleSimulateOrder}
            onSwitchToRadar={() => setActiveTab('radar')}
          />
        )}

        {activeTab === 'radar' && (
          <div className="space-y-4">
            <OpportunityRadar
              zones={radarData?.zones || []}
              topRecommendation={radarData?.topRecommendation}
            />
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="space-y-4">
            <ScreenshotOCR />
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4">
            <APISettings onClose={() => setActiveTab('dashboard')} />
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="space-y-4">
            <MissionPlanner mission={missionData} />
            <BurnoutGuardian burnoutData={burnoutData} onTakeBreak={() => alert("15-minute break logged!")} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-4">
            <ChatFallback />
          </div>
        )}
      </main>

      {/* Order Decision Modal */}
      {simulatedOrder && (
        <OrderDecisionModal
          orderData={simulatedOrder}
          onAccept={(ord, rec) => handleDecision(ord, 'accepted', rec)}
          onReject={(ord, rec) => handleDecision(ord, 'rejected', rec)}
          onClose={() => setSimulatedOrder(null)}
        />
      )}

      {/* Bottom Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
