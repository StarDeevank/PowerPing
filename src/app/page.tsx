"use client";

import React, { useState, useEffect, useCallback } from 'react';
import SiteHeader from '@/components/site-header';
import SectionTitle from '@/components/common/SectionTitle';
import ApplianceListItem from '@/components/dashboard/ApplianceListItem';
import EnergyPredictionCard from '@/components/dashboard/EnergyPredictionCard';
import PersonalizedTipsCard from '@/components/dashboard/PersonalizedTipsCard';
import IntelligentRemindersCard from '@/components/dashboard/IntelligentRemindersCard';
import RealTimeFeedbackItem from '@/components/dashboard/RealTimeFeedbackItem';
import { HomeConfigurationForm } from '@/components/forms/HomeConfigurationForm';
import { UsageSettingsForm } from '@/components/forms/UsageSettingsForm';
import { ApplianceForm, type ApplianceFormValues } from '@/components/forms/ApplianceForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import type {
  Appliance,
  HomeConfiguration,
  UsageSettings,
  HomeSize,
  EnergyPredictionData,
  DisplayPersonalizedTip,
  DisplayIntelligentReminder,
  PersonalizedTipsGenAIInput,
  EnergyPredictionGenAIInput,
  IntelligentRemindersGenAIInput,
} from '@/types';
import { predictEnergyUsage } from '@/ai/flows/energy-prediction';
import { generatePersonalizedTips } from '@/ai/flows/personalized-tips';
import { generateReminderRules } from '@/ai/flows/intelligent-reminders';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { toast } = useToast();

  // State for user configurations
  const [homeConfig, setHomeConfig] = useState<HomeConfiguration>({ homeSize: '', numberOfRooms: 1 });
  const [usageSettings, setUsageSettings] = useState<UsageSettings>({ monthlyElectricityBillGoal: 1000, currency: '₹' });
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  
  // State for AI-generated data
  const [energyPrediction, setEnergyPrediction] = useState<EnergyPredictionData | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<DisplayPersonalizedTip[]>([]);
  const [intelligentReminders, setIntelligentReminders] = useState<DisplayIntelligentReminder[]>([]);

  // Loading states for AI calls
  const [isPredictionLoading, setIsPredictionLoading] = useState(false);
  const [isTipsLoading, setIsTipsLoading] = useState(false);
  const [isRemindersLoading, setIsRemindersLoading] = useState(false);

  // Dialog states
  const [isHomeConfigOpen, setIsHomeConfigOpen] = useState(false);
  const [isUsageSettingsOpen, setIsUsageSettingsOpen] = useState(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);


  const canRunAI = useCallback(() => {
    return homeConfig.homeSize !== '' && homeConfig.numberOfRooms > 0 && appliances.length > 0;
  }, [homeConfig, appliances]);

  // AI function calls
  const fetchEnergyPrediction = useCallback(async () => {
    if (!canRunAI()) return;
    setIsPredictionLoading(true);
    try {
      const input: EnergyPredictionGenAIInput = {
        homeSize: homeConfig.homeSize as HomeSize, // Ensure type compatibility
        numberOfRooms: homeConfig.numberOfRooms,
        appliances: appliances.map(a => ({ deviceName: a.deviceName, room: a.room, estimatedDailyUsage: a.estimatedDailyUsage, status: a.status })),
        monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
        currency: usageSettings.currency,
      };
      const prediction = await predictEnergyUsage(input);
      setEnergyPrediction({...prediction, currency: usageSettings.currency}); // Add currency if not returned by AI
    } catch (error) {
      console.error("Failed to fetch energy prediction:", error);
      toast({ title: "Error", description: "Could not fetch energy prediction.", variant: "destructive" });
    } finally {
      setIsPredictionLoading(false);
    }
  }, [homeConfig, usageSettings, appliances, toast, canRunAI]);

  const fetchPersonalizedTips = useCallback(async () => {
    if (!canRunAI()) return;
    setIsTipsLoading(true);
    try {
      const input: PersonalizedTipsGenAIInput = {
        homeSize: homeConfig.homeSize as HomeSize,
        numberOfRooms: homeConfig.numberOfRooms,
        appliances: appliances.map(a => ({ deviceName: a.deviceName, room: a.room, estimatedDailyUsage: a.estimatedDailyUsage, status: a.status })),
        monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
      };
      const tipsResult = await generatePersonalizedTips(input);
      setPersonalizedTips(tipsResult.tips.map((tip, index) => ({ id: `tip-${index}`, text: tip })));
    } catch (error) {
      console.error("Failed to fetch personalized tips:", error);
      toast({ title: "Error", description: "Could not fetch personalized tips.", variant: "destructive" });
    } finally {
      setIsTipsLoading(false);
    }
  }, [homeConfig, usageSettings, appliances, toast, canRunAI]);

  const fetchIntelligentReminders = useCallback(async () => {
    if (!canRunAI()) return;
    setIsRemindersLoading(true);
    try {
      const input: IntelligentRemindersGenAIInput = {
        homeSize: homeConfig.homeSize as HomeSize,
        numberOfRooms: homeConfig.numberOfRooms,
        appliances: appliances.map(a => ({ deviceName: a.deviceName, room: a.room, estimatedDailyUsage: a.estimatedDailyUsage })),
        monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
      };
      const remindersResult = await generateReminderRules(input);
      setIntelligentReminders(remindersResult.reminderRules.map((r, index) => ({ id: `reminder-${index}`, ...r })));
    } catch (error) {
      console.error("Failed to fetch intelligent reminders:", error);
      toast({ title: "Error", description: "Could not fetch intelligent reminders.", variant: "destructive" });
    } finally {
      setIsRemindersLoading(false);
    }
  }, [homeConfig, usageSettings, appliances, toast, canRunAI]);

  useEffect(() => {
    if (canRunAI()) {
      fetchEnergyPrediction();
      fetchPersonalizedTips();
      fetchIntelligentReminders();
    } else {
      // Reset AI data if conditions are not met
      setEnergyPrediction(null);
      setPersonalizedTips([]);
      setIntelligentReminders([]);
    }
  }, [homeConfig, usageSettings, appliances, fetchEnergyPrediction, fetchPersonalizedTips, fetchIntelligentReminders, canRunAI]);


  // Handlers for form submissions
  const handleSaveHomeConfig = (data: HomeConfiguration) => {
    setHomeConfig(data);
    setIsHomeConfigOpen(false);
    toast({ title: "Success", description: "Home configuration saved." });
  };

  const handleSaveUsageSettings = (data: UsageSettings) => {
    setUsageSettings(data);
    setIsUsageSettingsOpen(false);
    toast({ title: "Success", description: "Usage settings saved." });
  };

  const handleSaveAppliance = (data: ApplianceFormValues) => {
    if (editingAppliance) {
      setAppliances(prev => prev.map(app => app.id === editingAppliance.id ? { ...app, ...data } : app));
      toast({ title: "Success", description: `${data.deviceName} updated.` });
    } else {
      const newAppliance: Appliance = { ...data, id: crypto.randomUUID() };
      setAppliances(prev => [...prev, newAppliance]);
      toast({ title: "Success", description: `${data.deviceName} added.` });
    }
    setIsApplianceFormOpen(false);
    setEditingAppliance(null);
  };
  
  const handleToggleApplianceStatus = (id: string, status: boolean) => {
    setAppliances(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  const handleEditAppliance = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setIsApplianceFormOpen(true);
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
    toast({ title: "Success", description: "Appliance removed." });
  };


  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader
        onOpenHomeConfig={() => setIsHomeConfigOpen(true)}
        onOpenUsageSettings={() => setIsUsageSettingsOpen(true)}
        onOpenAddAppliance={() => { setEditingAppliance(null); setIsApplianceFormOpen(true); }}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <EnergyPredictionCard data={energyPrediction} isLoading={isPredictionLoading} />

        <section>
          <div className="flex justify-between items-center mb-4">
            <SectionTitle>My Appliances ({appliances.length})</SectionTitle>
             <Button onClick={() => { setEditingAppliance(null); setIsApplianceFormOpen(true); }} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Appliance
            </Button>
          </div>
          {appliances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appliances.map((app) => (
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
            <Card className="p-6 text-center text-muted-foreground shadow-md">
              <p>No appliances added yet. Click "Add Appliance" to get started.</p>
            </Card>
          )}
        </section>

        <section className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          <PersonalizedTipsCard tips={personalizedTips} isLoading={isTipsLoading} />
          <IntelligentRemindersCard reminders={intelligentReminders} isLoading={isRemindersLoading} />
        </section>

        <section>
          <SectionTitle>Real-Time Feedback</SectionTitle>
          <div className="space-y-4">
            {appliances.filter(app => app.status).length > 0 ? 
              appliances.filter(app => app.status).map(app => (
                <RealTimeFeedbackItem key={`feedback-${app.id}`} appliance={app} />
              )) : 
              <Card className="p-6 text-center text-muted-foreground shadow-md">
                <p>No appliances are currently active.</p>
              </Card>
            }
          </div>
        </section>

      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
        WattWatcher AI &copy; {new Date().getFullYear()}
      </footer>

      {/* Dialogs */}
      <Dialog open={isHomeConfigOpen} onOpenChange={setIsHomeConfigOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Home Configuration</DialogTitle>
            <DialogDescription>Set up your home details for accurate predictions.</DialogDescription>
          </DialogHeader>
          <HomeConfigurationForm onSubmit={handleSaveHomeConfig} initialData={homeConfig} />
        </DialogContent>
      </Dialog>

      <Dialog open={isUsageSettingsOpen} onOpenChange={setIsUsageSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Usage Settings & Goals</DialogTitle>
            <DialogDescription>Define your monthly electricity bill goal.</DialogDescription>
          </DialogHeader>
          <UsageSettingsForm onSubmit={handleSaveUsageSettings} initialData={usageSettings} />
        </DialogContent>
      </Dialog>

      <Dialog open={isApplianceFormOpen} onOpenChange={(open) => { setIsApplianceFormOpen(open); if(!open) setEditingAppliance(null);}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAppliance ? "Edit Appliance" : "Add New Appliance"}</DialogTitle>
            <DialogDescription>
              {editingAppliance ? "Update the details for your appliance." : "Enter details for your new appliance."}
            </DialogDescription>
          </DialogHeader>
          <ApplianceForm 
            onSubmit={handleSaveAppliance} 
            initialData={editingAppliance || undefined}
            submitButtonText={editingAppliance ? "Save Changes" : "Add Appliance"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
