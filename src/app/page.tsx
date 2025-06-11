"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsageSettingsForm } from '@/components/forms/UsageSettingsForm';
import { ApplianceForm, type ApplianceFormValues } from '@/components/forms/ApplianceForm';
import ApplianceListItem from '@/components/dashboard/ApplianceListItem';
import EnergyPredictionCard from '@/components/dashboard/EnergyPredictionCard';
import IntelligentRemindersCard from '@/components/dashboard/IntelligentRemindersCard';
import PersonalizedTipsCard from '@/components/dashboard/PersonalizedTipsCard';
import RealTimeFeedbackItem from '@/components/dashboard/RealTimeFeedbackItem';
import SectionTitle from '@/components/common/SectionTitle';
import EnergyConsumptionChart from '@/components/dashboard/EnergyConsumptionChart';
import LiveWattageChart from '@/components/dashboard/LiveWattageChart';
import type {
  Appliance, UsageSettings,
  EnergyPredictionData, DisplayIntelligentReminder, DisplayPersonalizedTip
} from '@/types';
import { predictEnergyUsage } from '@/ai/flows/energy-prediction';
import { generatePersonalizedTips } from '@/ai/flows/personalized-tips';
import { generateReminderRules } from '@/ai/flows/intelligent-reminders';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, PlusCircle, Settings, BarChart2, Lightbulb, BellRing, Home, SlidersHorizontal, Zap, AlertCircle, Moon, Sun, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label"; 

const initialUsageSettings: UsageSettings = { monthlyElectricityBillGoal: 1000, currency: '₹' };

const MAX_LIVE_GRAPH_POINTS = 30;
const REALTIME_UPDATE_INTERVAL = 1000; // ms

// Helper for wattage estimation
const getApplianceWattage = (appliance: Appliance): number => {
    if (appliance.powerRating && appliance.powerRating > 0) {
      return appliance.powerRating;
    }
    // Fallback estimations based on type - can be expanded
    switch (appliance.applianceType.toLowerCase()) {
      case 'light': return 10 + Math.random() * 10; // 10-20W LED
      case 'fan': return 50 + Math.random() * 25; // 50-75W
      case 'air conditioner': return 1000 + Math.random() * 500; // 1000-1500W
      case 'refrigerator': return 100 + Math.random() * 100; // 100-200W (average running)
      case 'television': return 60 + Math.random() * 90; // 60-150W
      case 'geyser/water heater': return 2000 + Math.random() * 1000; // 2000-3000W
      case 'computer/laptop': return 50 + Math.random() * 100; // 50-150W
      default: return 75 + Math.random() * 75; // Generic fallback 75-150W
    }
};


export default function DashboardPage() {
  const { toast } = useToast();

  const [usageSettings, setUsageSettings] = useState<UsageSettings>(initialUsageSettings);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [energyPrediction, setEnergyPrediction] = useState<EnergyPredictionData | null>(null);
  const [personalizedTips, setPersonalizedTips] = useState<DisplayPersonalizedTip[]>([]);
  const [intelligentReminders, setIntelligentReminders] = useState<DisplayIntelligentReminder[]>([]);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);
  const [isApplianceFormOpen, setIsApplianceFormOpen] = useState(false);
  const [isUsageSettingsDialogOpen, setIsUsageSettingsDialogOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | undefined>(undefined);
  const [isSleepModeActive, setIsSleepModeActive] = useState(false);
  
  const [currentWattage, setCurrentWattage] = useState(0);
  const [estimatedBillToday, setEstimatedBillToday] = useState(0);
  const [estimatedBillMonth, setEstimatedBillMonth] = useState(0);
  const [liveGraphData, setLiveGraphData] = useState<{ time: number; wattage: number }[]>([]);
  const [timeCounter, setTimeCounter] = useState(0);


  useEffect(() => {
    const storedUsageSettings = localStorage.getItem('powerping_usageSettings');
    if (storedUsageSettings) setUsageSettings(JSON.parse(storedUsageSettings));
    const storedAppliances = localStorage.getItem('powerping_appliances');
    if (storedAppliances) setAppliances(JSON.parse(storedAppliances));
    const storedSleepMode = localStorage.getItem('powerping_sleepMode');
    if (storedSleepMode) setIsSleepModeActive(JSON.parse(storedSleepMode));
  }, []);

  useEffect(() => { localStorage.setItem('powerping_usageSettings', JSON.stringify(usageSettings));}, [usageSettings]);
  useEffect(() => { localStorage.setItem('powerping_appliances', JSON.stringify(appliances));}, [appliances]);
  useEffect(() => { localStorage.setItem('powerping_sleepMode', JSON.stringify(isSleepModeActive));}, [isSleepModeActive]);

  const fetchAIData = useCallback(async () => {
    if (isSleepModeActive || appliances.length === 0) {
      setEnergyPrediction(null);
      setPersonalizedTips([]);
      setIntelligentReminders([]);
      if (isSleepModeActive && appliances.length > 0) { 
        toast({ title: "Sleep Mode Active", description: "AI insights are paused." });
      }
      return;
    }

    const commonInput = {
      appliances: appliances.map(a => ({ 
        deviceName: a.deviceName, 
        room: a.room, 
        applianceType: a.applianceType,
        powerRating: a.powerRating,
        estimatedDailyUsage: a.estimatedDailyUsage, 
        status: a.status 
      })),
      monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
    };
    
    let allLoadedSuccessfully = true;

    setIsLoadingPrediction(true);
    try {
      const predictionResult = await predictEnergyUsage({ ...commonInput, currency: usageSettings.currency });
      setEnergyPrediction({...predictionResult, currency: usageSettings.currency});
    } catch (error) {
      console.error("Error fetching energy prediction:", error);
      toast({ title: "AI Error", description: "Could not fetch energy prediction.", variant: "destructive" });
      setEnergyPrediction(null);
      allLoadedSuccessfully = false;
    } finally { setIsLoadingPrediction(false); }

    setIsLoadingTips(true);
    try {
      const tipsResult = await generatePersonalizedTips(commonInput);
      setPersonalizedTips(tipsResult.tips.map((tip, index) => ({ id: `tip-${index}`, text: tip })));
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
      toast({ title: "AI Error", description: "Could not fetch personalized tips.", variant: "destructive" });
      setPersonalizedTips([]);
      allLoadedSuccessfully = false;
    } finally { setIsLoadingTips(false); }

    setIsLoadingReminders(true);
    try {
      const remindersResult = await generateReminderRules({
        appliances: appliances.map(a => ({ 
            deviceName: a.deviceName, 
            room: a.room, 
            applianceType: a.applianceType,
            powerRating: a.powerRating,
            estimatedDailyUsage: a.estimatedDailyUsage 
        })),
        monthlyElectricityBillGoal: usageSettings.monthlyElectricityBillGoal,
      });
      setIntelligentReminders(remindersResult.reminderRules.map((rule, index) => ({ id: `reminder-${index}`, applianceName: rule.applianceName, rule: rule.rule })));
    } catch (error) {
      console.error("Error fetching intelligent reminders:", error);
      toast({ title: "AI Error", description: "Could not fetch intelligent reminders.", variant: "destructive" });
      setIntelligentReminders([]);
      allLoadedSuccessfully = false;
    } finally { setIsLoadingReminders(false); }
    
    if (allLoadedSuccessfully && !isSleepModeActive) {
        toast({ title: "AI Insights Updated", description: "Predictions, tips, and reminders are up to date." });
    }

  }, [usageSettings, appliances, toast, isSleepModeActive]);

  useEffect(() => { fetchAIData(); }, [fetchAIData]);

  useEffect(() => {
    if (isSleepModeActive) {
        setCurrentWattage(0); 
        setLiveGraphData([]); 
        setEstimatedBillToday(0); // Reset daily bill in sleep mode
        return;
    }
    const interval = setInterval(() => {
      let totalWattage = 0;
      appliances.forEach(app => {
        if (app.status) {
          const baseWattage = getApplianceWattage(app);
          totalWattage += baseWattage + (Math.random() * baseWattage * 0.1); // Add small random fluctuation
        }
      });
      const newCurrentWattage = parseFloat(totalWattage.toFixed(0));
      setCurrentWattage(newCurrentWattage);
      
      setTimeCounter(prev => prev + 1);
      setLiveGraphData(prevData => {
        const newData = [...prevData, { time: timeCounter, wattage: newCurrentWattage }];
        if (newData.length > MAX_LIVE_GRAPH_POINTS) {
          return newData.slice(newData.length - MAX_LIVE_GRAPH_POINTS);
        }
        return newData;
      });
      
      const costPerKWh = usageSettings.currency === '₹' ? 7 : 0.15; 
      const currentKWhForInterval = (newCurrentWattage / 1000) * (REALTIME_UPDATE_INTERVAL / (1000 * 60 * 60)); // kWh for the interval
      
      setEstimatedBillToday(prevBill => parseFloat((prevBill + (currentKWhForInterval * costPerKWh)).toFixed(2)));
      
      setEstimatedBillMonth(prev => {
          const hourlyKWh = newCurrentWattage / 1000;
          const hourlyCost = hourlyKWh * costPerKWh;
          return parseFloat((hourlyCost * 24 * 30).toFixed(2)); // Estimated monthly based on current instant consumption
      });

    }, REALTIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [appliances, usageSettings, isSleepModeActive, timeCounter]);


  const handleUsageSettingsSubmit = (data: UsageSettings) => { setUsageSettings(data); setIsUsageSettingsDialogOpen(false); toast({ title: "Success", description: "Usage settings saved!" }); };

  const handleApplianceSubmit = (data: ApplianceFormValues) => {
    if (editingAppliance) {
      setAppliances(appliances.map(app => app.id === editingAppliance.id ? { ...editingAppliance, ...data } : app));
      toast({ title: "Success", description: "Appliance updated!" });
    } else {
      const newAppliance: Appliance = { 
        id: Date.now().toString(), 
        ...data, 
        powerRating: data.powerRating ? Number(data.powerRating) : undefined 
      };
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
      setEstimatedBillToday(0); // Reset bill on activating sleep mode
      toast({ title: "Sleep Mode Activated", description: "AI insights paused. Live stats and some controls are limited." });
    } else {
      // Optionally reset estimatedBillToday here too if you want a fresh start after awake
      // setEstimatedBillToday(0); 
      toast({ title: "Sleep Mode Deactivated", description: "System returning to normal. AI insights will refresh." });
    }
  };
  
  const isAIDataLoading = isLoadingPrediction || isLoadingTips || isLoadingReminders;

  const hasInitialSetup = appliances.length > 0;

  return (
    <div className="space-y-6 pt-6"> {/* Added pt-6 for spacing from top */}
      
      <div className="flex justify-end items-center space-x-2">
         <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAIData} 
            disabled={isSleepModeActive || isAIDataLoading || !hasInitialSetup}
            aria-label="Refresh AI Data"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${isAIDataLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh AI</span>
          </Button>
        <Button variant="outline" size="sm" onClick={handleToggleSleepMode} aria-label={isSleepModeActive ? "Deactivate Sleep Mode" : "Activate Sleep Mode"}>
          {isSleepModeActive ? <Sun className="h-4 w-4 sm:mr-2" /> : <Moon className="h-4 w-4 sm:mr-2" />}
          <span className="hidden sm:inline">{isSleepModeActive ? 'Awake Mode' : 'Sleep Mode'}</span>
        </Button>
      </div>

      <Dialog open={isApplianceFormOpen} onOpenChange={setIsApplianceFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAppliance ? 'Edit' : 'Add'} Appliance</DialogTitle></DialogHeader>
          <ApplianceForm onSubmit={handleApplianceSubmit} initialData={editingAppliance} submitButtonText={editingAppliance ? 'Save Changes' : 'Add Appliance'} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isUsageSettingsDialogOpen} onOpenChange={setIsUsageSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Usage Settings</DialogTitle></DialogHeader>
          <UsageSettingsForm onSubmit={handleUsageSettingsSubmit} initialData={usageSettings} />
        </DialogContent>
      </Dialog>

       {isSleepModeActive && (
        <Card className="border-primary/50 bg-primary/10">
         <CardHeader>
            <CardTitle className="flex items-center text-lg">
                <Moon className="h-5 w-5 mr-2 text-primary" /> Sleep Mode is Active
            </CardTitle>
         </CardHeader>
         <CardContent>
            <p className="text-sm text-primary-foreground/80">Energy saving mode is on. AI insights and some controls are limited. Live stats are paused.</p>
         </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard">
            <BarChart2 className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="appliances">
            <Zap className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Appliances</span>
          </TabsTrigger>
          <TabsTrigger value="livestats">
            <AlertCircle className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Live Stats</span>
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          {!hasInitialSetup && !isSleepModeActive && (
            <Card className="border-accent shadow-lg bg-muted">
              <CardHeader className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-3" />
                <CardTitle className="text-2xl text-foreground">Welcome to PowerPing!</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Let's get you set up to start saving energy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground">
                  To unlock personalized AI insights, please add your appliances.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                  <Button 
                    size="lg" 
                    onClick={openAddApplianceForm}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Appliance
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  You can add more appliances and adjust usage settings later.
                </p>
              </CardContent>
            </Card>
          )}

          {isSleepModeActive && !hasInitialSetup && (
             <Card>
                <CardHeader><CardTitle>Dashboard Unavailable</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Dashboard features are paused in Sleep Mode. Please deactivate Sleep Mode and complete setup.
                    </p>
                </CardContent>
            </Card>
          )}

          {hasInitialSetup && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                 {isSleepModeActive ? (
                     <Card>
                        <CardHeader><CardTitle>Dashboard Paused</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Dashboard features are paused in Sleep Mode.</p></CardContent>
                    </Card>
                 ) : (
                    <>
                        <EnergyConsumptionChart />
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
                    </>
                 )}
              </div>
              <div className="space-y-6">
                {isSleepModeActive ? (
                  <Card>
                    <CardHeader><CardTitle>AI Energy Prediction</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">
                      Insights are paused in Sleep Mode.
                    </p></CardContent>
                  </Card>
                ) : (
                  <EnergyPredictionCard data={energyPrediction} isLoading={isLoadingPrediction} />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appliances">
          <SectionTitle>My Appliances</SectionTitle>
           {isSleepModeActive ? (
             <Card>
                <CardHeader><CardTitle>Appliance Management Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Appliance list and controls are unavailable in Sleep Mode.</p></CardContent>
            </Card>
           ) : (
            <>
              <Button onClick={openAddApplianceForm} variant="default" className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Appliance
              </Button>
              {appliances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appliances.map(app => (
                    <ApplianceListItem key={app.id} appliance={app} onToggleStatus={handleToggleApplianceStatus} onEdit={handleEditAppliance} onDelete={handleDeleteAppliance} isSleepModeActive={isSleepModeActive} />
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No appliances added yet. Click "Add Appliance" to get started.</p>}
            </>
           )}
        </TabsContent>

        <TabsContent value="livestats">
          <SectionTitle>Live Energy Statistics</SectionTitle>
          {isSleepModeActive ? (
             <Card>
                <CardHeader><CardTitle>Live Stats Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Live statistics are paused in Sleep Mode.</p></CardContent>
            </Card>
          ) : hasInitialSetup ? (
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
                  <p className="text-xs text-muted-foreground">Accumulated since app start/awake</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Est. Bill (This Month)</CardTitle>
                   <span className="text-muted-foreground">{usageSettings.currency}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageSettings.currency}{estimatedBillMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Projected from current trends</p>
                </CardContent>
              </Card>
              <LiveWattageChart data={liveGraphData} />
            </div>
          ) : (
             <Card>
                <CardHeader><CardTitle>Live Stats Unavailable</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Add appliances to see live statistics.</p></CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="insights">
           <SectionTitle>AI Insights</SectionTitle>
           {isSleepModeActive || !hasInitialSetup ? (
             <Card>
                <CardHeader><CardTitle>AI Insights Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">
                    {isSleepModeActive ? "Reminders and Tips are paused in Sleep Mode." : "Add appliances to get AI insights."}
                </p></CardContent>
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
          <div className="space-y-6 max-w-md mx-auto">
            <Card>
              <CardHeader><CardTitle className="text-lg">Core Configuration</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setIsUsageSettingsDialogOpen(true)} variant="outline" className="w-full justify-start text-base py-6">
                  <SlidersHorizontal className="mr-3 h-5 w-5" /> Usage Goals & Currency
                </Button>
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle className="text-lg">Advanced (Coming Soon)</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-md border border-dashed">
                    <Label htmlFor="smart-plugs" className="flex flex-col space-y-1">
                        <span className="font-medium">Connect Smart Plugs</span>
                        <span className="text-xs text-muted-foreground">Sync with compatible smart devices.</span>
                    </Label>
                    <Switch id="smart-plugs" disabled />
                </div>
                <div className="flex items-center justify-between p-4 rounded-md border border-dashed">
                     <Label htmlFor="ai-suggestions" className="flex flex-col space-y-1">
                        <span className="font-medium">Enable AI Auto-Suggestions</span>
                        <span className="text-xs text-muted-foreground">Allow AI to proactively offer tips.</span>
                    </Label>
                    <Switch id="ai-suggestions" disabled checked />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="mr-3 h-5 w-5 text-primary" /> Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Concept and Design by:</span> Deevank, Class X-C</p>
                <p><span className="font-medium text-foreground">School:</span> St. Joseph’s Sr. Sec. School, Sector 44D, Chandigarh</p>
                <p><span className="font-medium text-foreground">Project:</span> Created for Holiday Homework (AI Project) – 2025–26</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
