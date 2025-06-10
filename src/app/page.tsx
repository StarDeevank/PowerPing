
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import EnergyConsumptionChart from '@/components/dashboard/EnergyConsumptionChart';
import type {
  Appliance, HomeConfiguration, UsageSettings, HomeSize,
  EnergyPredictionData, DisplayIntelligentReminder, DisplayPersonalizedTip
} from '@/types';
import { predictEnergyUsage } from '@/ai/flows/energy-prediction';
import { generatePersonalizedTips } from '@/ai/flows/personalized-tips';
import { generateReminderRules } from '@/ai/flows/intelligent-reminders';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, PlusCircle, Settings, BarChart2, Lightbulb, BellRing, Home, SlidersHorizontal, Zap, AlertCircle, Moon, Sun } from 'lucide-react'; // Added icons for tabs
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";


const initialHomeConfig: HomeConfiguration = { homeSize: '', numberOfRooms: 1 };
const initialUsageSettings: UsageSettings = { monthlyElectricityBillGoal: 1000, currency: '₹' };

export default function DashboardPage() {
  const { toast } = useToast();

  const [homeConfiguration, setHomeConfiguration] = useState<HomeConfiguration>(initialHomeConfig);
  const [usageSettings, setUsageSettings] = useState<UsageSettings>(initialUsageSettings);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [energyPrediction, setEnergyPrediction] = useState<EnergyPredictionData | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<DisplayPersonalizedTip[]>([]);
  const [intelligentReminders, setIntelligentReminders] = useState<DisplayIntelligentReminder[]>([]);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [isHomeConfigDialogOpen, setIsHomeConfigDialogOpen] = useState(false);
  const [isUsageSettingsDialogOpen, setIsUsageSettingsDialogOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | undefined>(undefined);
  const [isSleepModeActive, setIsSleepModeActive] = useState(false);
  
  // State for mock real-time data
  const [currentWattage, setCurrentWattage] = useState(0);
  const [estimatedBillToday, setEstimatedBillToday] = useState(0);
  const [estimatedBillMonth, setEstimatedBillMonth] = useState(0);

  useEffect(() => {
    const storedHomeConfig = localStorage.getItem('wattwatcher_homeConfig');
    if (storedHomeConfig) setHomeConfiguration(JSON.parse(storedHomeConfig));
    const storedUsageSettings = localStorage.getItem('wattwatcher_usageSettings');
    if (storedUsageSettings) setUsageSettings(JSON.parse(storedUsageSettings));
    const storedAppliances = localStorage.getItem('wattwatcher_appliances');
    if (storedAppliances) setAppliances(JSON.parse(storedAppliances));
    const storedSleepMode = localStorage.getItem('wattwatcher_sleepMode');
    if (storedSleepMode) setIsSleepModeActive(JSON.parse(storedSleepMode));
  }, []);

  useEffect(() => { localStorage.setItem('wattwatcher_homeConfig', JSON.stringify(homeConfiguration));}, [homeConfiguration]);
  useEffect(() => { localStorage.setItem('wattwatcher_usageSettings', JSON.stringify(usageSettings));}, [usageSettings]);
  useEffect(() => { localStorage.setItem('wattwatcher_appliances', JSON.stringify(appliances));}, [appliances]);
  useEffect(() => { localStorage.setItem('wattwatcher_sleepMode', JSON.stringify(isSleepModeActive));}, [isSleepModeActive]);

  const fetchAIData = useCallback(async () => {
    if (isSleepModeActive || !homeConfiguration.homeSize || appliances.length === 0) {
      setEnergyPrediction(null);
      setPersonalizedTips([]);
      setIntelligentReminders([]);
      if (isSleepModeActive) {
        toast({ title: "Sleep Mode Active", description: "AI insights are paused." });
      }
      return;
    }

    const commonInput = {
      homeSize: homeConfiguration.homeSize as HomeSize,
      numberOfRooms: homeConfiguration.numberOfRooms,
      appliances: appliances.map(a => ({ deviceName: a.deviceName, room: a.room, estimatedDailyUsage: a.estimatedDailyUsage, status: a.status })),
      monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
    };

    setIsLoadingPrediction(true);
    try {
      const predictionResult = await predictEnergyUsage({ ...commonInput, currency: usageSettings.currency });
      setEnergyPrediction({...predictionResult, currency: usageSettings.currency});
    } catch (error) {
      console.error("Error fetching energy prediction:", error);
      toast({ title: "AI Error", description: "Could not fetch energy prediction.", variant: "destructive" });
      setEnergyPrediction(null);
    } finally { setIsLoadingPrediction(false); }

    setIsLoadingTips(true);
    try {
      const tipsResult = await generatePersonalizedTips(commonInput);
      setPersonalizedTips(tipsResult.tips.map((tip, index) => ({ id: `tip-${index}`, text: tip })));
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
      toast({ title: "AI Error", description: "Could not fetch personalized tips.", variant: "destructive" });
      setPersonalizedTips([]);
    } finally { setIsLoadingTips(false); }

    setIsLoadingReminders(true);
    try {
      const remindersResult = await generateReminderRules({ ...commonInput, appliances: appliances.map(a => ({ deviceName: a.deviceName, room: a.room, estimatedDailyUsage: a.estimatedDailyUsage })) });
      setIntelligentReminders(remindersResult.reminderRules.map((rule, index) => ({ id: `reminder-${index}`, applianceName: rule.applianceName, rule: rule.rule })));
    } catch (error) {
      console.error("Error fetching intelligent reminders:", error);
      toast({ title: "AI Error", description: "Could not fetch intelligent reminders.", variant: "destructive" });
      setIntelligentReminders([]);
    } finally { setIsLoadingReminders(false); }
  }, [homeConfiguration, usageSettings, appliances, toast, isSleepModeActive]);

  useEffect(() => { fetchAIData(); }, [fetchAIData]);

  // Mock real-time data updates
  useEffect(() => {
    if (isSleepModeActive) {
        setCurrentWattage(0); // Or a very low baseline
        // Potentially pause bill updates or show them as static
        return;
    }
    const interval = setInterval(() => {
      let totalWattage = 0;
      appliances.forEach(app => {
        if (app.status) {
          // Simplified wattage based on usage hours (very rough estimate)
          totalWattage += app.estimatedDailyUsage * 50 + Math.random() * 50; 
        }
      });
      setCurrentWattage(parseFloat(totalWattage.toFixed(0)));
      
      // Mock bill calculation (highly simplified)
      const costPerKWh = usageSettings.currency === '₹' ? 7 : 0.15;
      const dailyKWh = (totalWattage * 24) / 1000; // Assuming current wattage persists
      setEstimatedBillToday(parseFloat((dailyKWh * costPerKWh).toFixed(2)));
      setEstimatedBillMonth(parseFloat((dailyKWh * 30 * costPerKWh).toFixed(2)));

    }, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [appliances, usageSettings, isSleepModeActive]);


  const handleHomeConfigSubmit = (data: HomeConfiguration) => { setHomeConfiguration(data); setIsHomeConfigDialogOpen(false); toast({ title: "Success", description: "Home configuration saved!" }); };
  const handleUsageSettingsSubmit = (data: UsageSettings) => { setUsageSettings(data); setIsUsageSettingsDialogOpen(false); toast({ title: "Success", description: "Usage settings saved!" }); };

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

  const handleEditAppliance = (appliance: Appliance) => { setEditingAppliance(appliance); setIsApplianceFormOpen(true); };
  const handleDeleteAppliance = (id: string) => { setAppliances(appliances.filter(app => app.id !== id)); toast({ title: "Success", description: "Appliance deleted." }); };
  const handleToggleApplianceStatus = (id: string, status: boolean) => {
    setAppliances(appliances.map(app => {
      if (app.id === id) {
        if (isSleepModeActive && status) {
          toast({ title: "Sleep Mode Active", description: `${app.deviceName} cannot be turned on. Deactivate sleep mode.`, variant: "destructive"});
          return app;
        }
        return { ...app, status };
      }
      return app;
    }));
  };
  
  const openAddApplianceForm = () => { setEditingAppliance(undefined); setIsApplianceFormOpen(true); }
  const handleToggleSleepMode = () => {
    const newSleepModeState = !isSleepModeActive;
    setIsSleepModeActive(newSleepModeState);
    if (newSleepModeState) {
      toast({ title: "Sleep Mode Activated", description: "AI insights paused." });
    } else {
      toast({ title: "Sleep Mode Deactivated", description: "System returning to normal." });
    }
    fetchAIData();
  };

  const hasInitialSetup = homeConfiguration.homeSize && appliances.length > 0;

  return (
    <div className="space-y-6">
      <SiteHeader isSleepModeActive={isSleepModeActive} onToggleSleepMode={handleToggleSleepMode} />

      <Dialog open={isApplianceFormOpen} onOpenChange={setIsApplianceFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAppliance ? 'Edit' : 'Add'} Appliance</DialogTitle></DialogHeader>
          <ApplianceForm onSubmit={handleApplianceSubmit} initialData={editingAppliance} submitButtonText={editingAppliance ? 'Save Changes' : 'Add Appliance'} />
        </DialogContent>
      </Dialog>
      
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

      {!hasInitialSetup && !isSleepModeActive && (
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm flex items-center space-x-3">
          <Info className="h-6 w-6 text-accent" />
          <div>
            <p className="font-semibold">Welcome to WattWatcher AI!</p>
            <p className="text-sm text-muted-foreground">Configure your home and add appliances in 'Settings', then add appliances in the 'Appliances' tab.</p>
          </div>
        </div>
      )}
       {isSleepModeActive && (
        <div className="p-6 rounded-lg border border-primary bg-primary/10 text-primary-foreground shadow-sm flex items-center space-x-3">
          <Moon className="h-6 w-6 text-primary" />
          <div>
            <p className="font-semibold">Sleep Mode is Active</p>
            <p className="text-sm">Energy saving mode is on. AI insights and some controls may be limited.</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4 inline-block md:hidden"/>Dashboard</TabsTrigger>
          <TabsTrigger value="appliances"><Zap className="mr-2 h-4 w-4 inline-block md:hidden"/>Appliances</TabsTrigger>
          <TabsTrigger value="livestats"><AlertCircle className="mr-2 h-4 w-4 inline-block md:hidden"/>Live Stats</TabsTrigger>
          <TabsTrigger value="insights" className="hidden md:inline-flex"><Lightbulb className="mr-2 h-4 w-4"/>Insights</TabsTrigger>
          <TabsTrigger value="settings" className="hidden md:inline-flex"><Settings className="mr-2 h-4 w-4"/>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {hasInitialSetup && !isSleepModeActive && <EnergyConsumptionChart />}
              {hasInitialSetup && !isSleepModeActive && (
                <div>
                  <SectionTitle>Real-Time Feedback</SectionTitle>
                  {appliances.some(app => app.status) ? (
                    <div className="space-y-3">
                      {appliances.filter(app => app.status).map(app => (
                        <RealTimeFeedbackItem key={app.id} appliance={app} onToggleStatus={handleToggleApplianceStatus} />
                      ))}
                    </div>
                  ) : <p className="text-muted-foreground">No appliances are currently active.</p>}
                </div>
              )}
            </div>
            <div className="space-y-6">
              {isSleepModeActive ? (
                <Card>
                  <CardHeader><CardTitle>AI Insights Paused</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground">Insights are paused in Sleep Mode.</p></CardContent>
                </Card>
              ) : (
                <EnergyPredictionCard data={energyPrediction} isLoading={isLoadingPrediction} />
              )}
            </div>
          </div>
           {!hasInitialSetup && !isSleepModeActive && (
             <p className="text-muted-foreground mt-4">Configure settings and add appliances to see dashboard data.</p>
           )}
        </TabsContent>

        <TabsContent value="appliances">
          <SectionTitle>My Appliances</SectionTitle>
          <Button onClick={openAddApplianceForm} variant="default" className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Appliance
          </Button>
          {appliances.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appliances.map(app => (
                <ApplianceListItem key={app.id} appliance={app} onToggleStatus={handleToggleApplianceStatus} onEdit={handleEditAppliance} onDelete={handleDeleteAppliance} isSleepModeActive={isSleepModeActive} />
              ))}
            </div>
          ) : <p className="text-muted-foreground">{isSleepModeActive ? "Appliance list hidden." : 'No appliances added yet.'}</p>}
        </TabsContent>

        <TabsContent value="livestats">
          <SectionTitle>Live Energy Statistics</SectionTitle>
          {isSleepModeActive ? (
             <Card>
                <CardHeader><CardTitle>Live Stats Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Live statistics are paused in Sleep Mode.</p></CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Wattage</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWattage} W</div>
                  <p className="text-xs text-muted-foreground">Real-time power draw</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Est. Bill (Today)</CardTitle>
                  <span className="text-muted-foreground">{usageSettings.currency}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageSettings.currency}{estimatedBillToday.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Based on current usage</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Est. Bill (Month)</CardTitle>
                   <span className="text-muted-foreground">{usageSettings.currency}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageSettings.currency}{estimatedBillMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Projected from current trends</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="insights">
           <SectionTitle>AI Insights</SectionTitle>
           {isSleepModeActive ? (
             <Card>
                <CardHeader><CardTitle>AI Insights Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Reminders and Tips are paused in Sleep Mode.</p></CardContent>
            </Card>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <IntelligentRemindersCard reminders={intelligentReminders} isLoading={isLoadingReminders} />
                <PersonalizedTipsCard tips={personalizedTips} isLoading={isLoadingTips} />
            </div>
           )}
        </TabsContent>

        <TabsContent value="settings">
          <SectionTitle>App Settings</SectionTitle>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setIsHomeConfigDialogOpen(true)} variant="outline" className="w-full justify-start">
                  <Home className="mr-2 h-4 w-4" /> Home Configuration
                </Button>
                <Button onClick={() => setIsUsageSettingsDialogOpen(true)} variant="outline" className="w-full justify-start">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Usage Goals & Currency
                </Button>
              </CardContent>
            </Card>
            {/* Placeholder for future settings like smart plug connection, AI suggestions toggle */}
             <Card>
              <CardHeader><CardTitle className="text-lg">Advanced (Coming Soon)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md border border-dashed">
                    <span className="text-muted-foreground">Connect Smart Plugs</span>
                    <Switch disabled />
                </div>
                <div className="flex items-center justify-between p-3 rounded-md border border-dashed">
                    <span className="text-muted-foreground">Enable AI Auto-Suggestions</span>
                    <Switch disabled checked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
