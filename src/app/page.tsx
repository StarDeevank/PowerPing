
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HomeConfigurationForm } from '@/components/forms/HomeConfigurationForm';
import { UsageSettingsForm } from '@/components/forms/UsageSettingsForm';
import { ApplianceForm, type ApplianceFormValues } from '@/components/forms/ApplianceForm';
import ApplianceListItem from '@/components/dashboard/ApplianceListItem';
import EnergyPredictionCard from '@/components/dashboard/EnergyPredictionCard';
import IntelligentRemindersCard from '@/components/dashboard/IntelligentRemindersCard';
import PersonalizedTipsCard from '@/components/dashboard/PersonalizedTipsCard';
import RealTimeFeedbackItem from '@/components/dashboard/RealTimeFeedbackItem';
import SectionTitle from '@/components/common/SectionTitle';
import SiteHeader from '@/components/site-header';
import type {
  Appliance, HomeConfiguration, UsageSettings, HomeSize,
  EnergyPredictionData, DisplayIntelligentReminder, DisplayPersonalizedTip, IntelligentReminderRule
} from '@/types';
import { predictEnergyUsage } from '@/ai/flows/energy-prediction';
import { generatePersonalizedTips } from '@/ai/flows/personalized-tips';
import { generateReminderRules } from '@/ai/flows/intelligent-reminders';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

const initialHomeConfig: HomeConfiguration = { homeSize: '', numberOfRooms: 1 };
const initialUsageSettings: UsageSettings = { monthlyElectricityBillGoal: 1000, currency: '₹' };

export default function DashboardPage() {
  const { toast } = useToast();

  // State for user configurations
  const [homeConfiguration, setHomeConfiguration] = useState<HomeConfiguration>(initialHomeConfig);
  const [usageSettings, setUsageSettings] = useState<UsageSettings>(initialUsageSettings);
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  // State for AI-generated data
  const [energyPrediction, setEnergyPrediction] = useState<EnergyPredictionData | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<DisplayPersonalizedTip[]>([]);
  const [intelligentReminders, setIntelligentReminders] = useState<DisplayIntelligentReminder[]>([]);

  // State for loading indicators
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);

  // State for dialogs
  const [isHomeConfigDialogOpen, setIsHomeConfigDialogOpen] = useState(false);
  const [isUsageSettingsDialogOpen, setIsUsageSettingsDialogOpen] = useState(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | undefined>(undefined);

  // --- Local Storage ---
  useEffect(() => {
    const storedHomeConfig = localStorage.getItem('wattwatcher_homeConfig');
    if (storedHomeConfig) setHomeConfiguration(JSON.parse(storedHomeConfig));

    const storedUsageSettings = localStorage.getItem('wattwatcher_usageSettings');
    if (storedUsageSettings) setUsageSettings(JSON.parse(storedUsageSettings));

    const storedAppliances = localStorage.getItem('wattwatcher_appliances');
    if (storedAppliances) setAppliances(JSON.parse(storedAppliances));
  }, []);

  useEffect(() => {
    localStorage.setItem('wattwatcher_homeConfig', JSON.stringify(homeConfiguration));
  }, [homeConfiguration]);

  useEffect(() => {
    localStorage.setItem('wattwatcher_usageSettings', JSON.stringify(usageSettings));
  }, [usageSettings]);

  useEffect(() => {
    localStorage.setItem('wattwatcher_appliances', JSON.stringify(appliances));
  }, [appliances]);

  // --- AI Flow Triggers ---
  const fetchAIData = useCallback(async () => {
    if (!homeConfiguration.homeSize || appliances.length === 0) {
      // Reset AI data if core config is missing
      setEnergyPrediction(null);
      setPersonalizedTips([]);
      setIntelligentReminders([]);
      return;
    }

    const commonInput = {
      homeSize: homeConfiguration.homeSize as HomeSize, // Cast as it won't be empty here
      numberOfRooms: homeConfiguration.numberOfRooms,
      appliances: appliances.map(a => ({
        deviceName: a.deviceName,
        room: a.room,
        estimatedDailyUsage: a.estimatedDailyUsage,
        status: a.status, // Ensure status is included for predictions/tips
      })),
      monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
    };

    // Energy Prediction
    setIsLoadingPrediction(true);
    try {
      const predictionResult = await predictEnergyUsage({
        ...commonInput,
        currency: usageSettings.currency,
      });
      setEnergyPrediction({...predictionResult, currency: usageSettings.currency});
    } catch (error) {
      console.error("Error fetching energy prediction:", error);
      toast({ title: "AI Error", description: "Could not fetch energy prediction.", variant: "destructive" });
      setEnergyPrediction(null);
    } finally {
      setIsLoadingPrediction(false);
    }

    // Personalized Tips
    setIsLoadingTips(true);
    try {
      const tipsResult = await generatePersonalizedTips(commonInput);
      setPersonalizedTips(tipsResult.tips.map((tip, index) => ({ id: `tip-${index}`, text: tip })));
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
      toast({ title: "AI Error", description: "Could not fetch personalized tips.", variant: "destructive" });
      setPersonalizedTips([]);
    } finally {
      setIsLoadingTips(false);
    }

    // Intelligent Reminders
    setIsLoadingReminders(true);
    try {
      const remindersResult = await generateReminderRules({
         ...commonInput,
         appliances: appliances.map(a => ({ // Reminders might only need usage, not status
            deviceName: a.deviceName,
            room: a.room,
            estimatedDailyUsage: a.estimatedDailyUsage,
        })),
      });
      setIntelligentReminders(remindersResult.reminderRules.map((rule, index) => ({
        id: `reminder-${index}`,
        applianceName: rule.applianceName,
        rule: rule.rule,
      })));
    } catch (error) {
      console.error("Error fetching intelligent reminders:", error);
      toast({ title: "AI Error", description: "Could not fetch intelligent reminders.", variant: "destructive" });
      setIntelligentReminders([]);
    } finally {
      setIsLoadingReminders(false);
    }
  }, [homeConfiguration, usageSettings, appliances, toast]);

  useEffect(() => {
    fetchAIData();
  }, [fetchAIData]);


  // --- Form Handlers ---
  const handleHomeConfigSubmit = (data: HomeConfiguration) => {
    setHomeConfiguration(data);
    setIsHomeConfigDialogOpen(false);
    toast({ title: "Success", description: "Home configuration saved!" });
  };

  const handleUsageSettingsSubmit = (data: UsageSettings) => {
    setUsageSettings(data);
    setIsUsageSettingsDialogOpen(false);
    toast({ title: "Success", description: "Usage settings saved!" });
  };

  const handleApplianceSubmit = (data: ApplianceFormValues) => {
    if (editingAppliance) {
      setAppliances(appliances.map(app => app.id === editingAppliance.id ? { ...editingAppliance, ...data } : app));
      toast({ title: "Success", description: "Appliance updated!" });
    } else {
      const newAppliance: Appliance = { id: Date.now().toString(), ...data };
      setAppliances([...appliances, newAppliance]);
      toast({ title: "Success", description: "Appliance added!" });
    }
    setIsApplianceFormOpen(false);
    setEditingAppliance(undefined);
  };

  // --- Appliance CRUD ---
  const handleEditAppliance = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setIsApplianceFormOpen(true);
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances(appliances.filter(app => app.id !== id));
    toast({ title: "Success", description: "Appliance deleted." });
  };

  const handleToggleApplianceStatus = (id: string, status: boolean) => {
    setAppliances(appliances.map(app => app.id === id ? { ...app, status } : app));
  };

  const openAddApplianceForm = () => {
    setEditingAppliance(undefined);
    setIsApplianceFormOpen(true);
  }

  const hasInitialSetup = homeConfiguration.homeSize && appliances.length > 0;

  return (
    <div className="space-y-8">
      <SiteHeader
        onOpenHomeConfig={() => setIsHomeConfigDialogOpen(true)}
        onOpenUsageSettings={() => setIsUsageSettingsDialogOpen(true)}
        onOpenAddAppliance={openAddApplianceForm}
      />

      {/* Dialogs for Forms */}
      <Dialog open={isHomeConfigDialogOpen} onOpenChange={setIsHomeConfigDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Home Configuration</DialogTitle></DialogHeader>
          <HomeConfigurationForm onSubmit={handleHomeConfigSubmit} initialData={homeConfiguration} />
        </DialogContent>
      </Dialog>

      <Dialog open={isUsageSettingsDialogOpen} onOpenChange={setIsUsageSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Usage Settings</DialogTitle></DialogHeader>
          <UsageSettingsForm onSubmit={handleUsageSettingsSubmit} initialData={usageSettings} />
        </DialogContent>
      </Dialog>

      <Dialog open={isApplianceFormOpen} onOpenChange={setIsApplianceFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAppliance ? 'Edit' : 'Add'} Appliance</DialogTitle></DialogHeader>
          <ApplianceForm
            onSubmit={handleApplianceSubmit}
            initialData={editingAppliance}
            submitButtonText={editingAppliance ? 'Save Changes' : 'Add Appliance'}
          />
        </DialogContent>
      </Dialog>

      {/* Main Dashboard Layout */}
      {!hasInitialSetup && (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center space-x-3">
          <Info className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold">Welcome to WattWatcher AI!</p>
            <p className="text-sm text-muted-foreground">
              Start by configuring your home and adding appliances to get personalized insights.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <SectionTitle>My Appliances</SectionTitle>
            {appliances.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appliances.map(app => (
                  <ApplianceListItem
                    key={app.id}
                    appliance={app}
                    onToggleStatus={handleToggleApplianceStatus}
                    onEdit={handleEditAppliance}
                    onDelete={handleDeleteAppliance}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No appliances added yet. Click "Add Appliance" in the header to get started.</p>
            )}
          </div>

          {hasInitialSetup && (
            <div>
              <SectionTitle>Real-Time Feedback</SectionTitle>
              {appliances.some(app => app.status) ? (
                <div className="space-y-3">
                  {appliances.filter(app => app.status).map(app => (
                    <RealTimeFeedbackItem key={app.id} appliance={app} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No appliances are currently active.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column / AI Insights */}
        <div className="space-y-6">
          <EnergyPredictionCard data={energyPrediction} isLoading={isLoadingPrediction} />
          <IntelligentRemindersCard reminders={intelligentReminders} isLoading={isLoadingReminders} />
          <PersonalizedTipsCard tips={personalizedTips} isLoading={isLoadingTips} />
        </div>
      </div>
    </div>
  );
}
