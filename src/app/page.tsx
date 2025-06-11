
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  EnergyPredictionData, DisplayIntelligentReminder, DisplayPersonalizedTip,
  DailyRecords
} from '@/types';
import { predictEnergyUsage } from '@/ai/flows/energy-prediction';
import { generatePersonalizedTips } from '@/ai/flows/personalized-tips';
import { generateReminderRules } from '@/ai/flows/intelligent-reminders';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, PlusCircle, Settings, BarChart2, Lightbulb, BellRing, Home, SlidersHorizontal, Zap, AlertCircle, Moon, Sun, RefreshCw, Sparkles, BookOpen, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { format, isSameDay, startOfDay, subDays, parseISO, getMonth, getYear } from 'date-fns';

const initialUsageSettings: UsageSettings = { monthlyElectricityBillGoal: 1000, currency: '₹' };

const MAX_LIVE_GRAPH_POINTS = 30;
const REALTIME_UPDATE_INTERVAL = 1000; // ms (1 second)
const MIDNIGHT_CHECK_INTERVAL = 60000; // 1 minute, to check for day change

const getApplianceWattage = (appliance: Appliance): number => {
    if (appliance.powerRating && appliance.powerRating > 0) {
      return appliance.powerRating + (Math.random() - 0.5) * (appliance.powerRating * 0.05);
    }
    const name = appliance.deviceName.toLowerCase();
    if (name.includes('light') || name.includes('lamp') || name.includes('led')) return 15;
    if (name.includes('fan')) return 60;
    if (name.includes('ac') || name.includes('air conditioner')) return 1200;
    if (name.includes('fridge') || name.includes('refrigerator')) return 150;
    if (name.includes('tv') || name.includes('television')) return 100;
    if (name.includes('geyser') || name.includes('water heater')) return 2500;
    if (name.includes('computer') || name.includes('laptop') || name.includes('pc')) return 100;
    if (name.includes('oven') || name.includes('microwave')) return 1000;
    if (name.includes('washer') || name.includes('washing machine')) return 400;
    return 100; 
};

const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

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

  const [dailyRecords, setDailyRecords] = useState<DailyRecords>({});
  const [currentDayKWh, setCurrentDayKWh] = useState(0);
  const [currentDayCost, setCurrentDayCost] = useState(0);

  const [currentWattage, setCurrentWattage] = useState(0);
  const [liveGraphData, setLiveGraphData] = useState<{ time: number; wattage: number }[]>([]);
  const timeCounterRef = useRef(0);
  const [lastRolloverCheck, setLastRolloverCheck] = useState<Date>(startOfDay(new Date()));

  const currentDayKWhRef = useRef(currentDayKWh);
  const currentDayCostRef = useRef(currentDayCost);
  const usageSettingsRef = useRef(usageSettings);
  const appliancesRef = useRef(appliances);
  
  useEffect(() => { currentDayKWhRef.current = currentDayKWh; }, [currentDayKWh]);
  useEffect(() => { currentDayCostRef.current = currentDayCost; }, [currentDayCost]);
  useEffect(() => { usageSettingsRef.current = usageSettings; }, [usageSettings]);
  useEffect(() => { appliancesRef.current = appliances; }, [appliances]);

  useEffect(() => {
    const storedUsageSettings = localStorage.getItem('powerping_usageSettings');
    if (storedUsageSettings) {
        try {
            const parsedSettings = JSON.parse(storedUsageSettings);
            if (parsedSettings && typeof parsedSettings.monthlyElectricityBillGoal === 'number' && (parsedSettings.currency === '₹' || parsedSettings.currency === '$')) {
                 setUsageSettings(parsedSettings);
            }
        } catch (e) { console.error("Error parsing usage settings from localStorage", e); }
    }

    const storedAppliances = localStorage.getItem('powerping_appliances');
    if (storedAppliances) {
        try {
            const parsedAppliances = JSON.parse(storedAppliances);
            if(Array.isArray(parsedAppliances)) {
                setAppliances(parsedAppliances);
            }
        } catch (e) { console.error("Error parsing appliances from localStorage", e); }
    }

    const storedSleepMode = localStorage.getItem('powerping_sleepMode');
    if (storedSleepMode) {
        try {
            setIsSleepModeActive(JSON.parse(storedSleepMode));
        } catch (e) { console.error("Error parsing sleep mode from localStorage", e); }
    }
    
    const storedDailyRecords = localStorage.getItem('powerping_dailyRecords');
    if (storedDailyRecords) {
      try {
        const parsedRecords = JSON.parse(storedDailyRecords);
        if (typeof parsedRecords === 'object' && parsedRecords !== null) {
          setDailyRecords(parsedRecords);
        } else {
          console.warn("Loaded dailyRecords is not a valid object, defaulting to empty.");
          setDailyRecords({});
        }
      } catch (e) {
        console.error("Error parsing dailyRecords from localStorage", e);
        setDailyRecords({});
      }
    } else {
      setDailyRecords({});
    }

    const todayKey = formatDateKey(new Date());
    const storedTodayKWh = localStorage.getItem(`powerping_currentDayKWh_${todayKey}`);
    if (storedTodayKWh) {
        const parsedKWh = parseFloat(storedTodayKWh);
        setCurrentDayKWh(isNaN(parsedKWh) ? 0 : parsedKWh);
    } else {
        setCurrentDayKWh(0);
    }

    const storedTodayCost = localStorage.getItem(`powerping_currentDayCost_${todayKey}`);
    if (storedTodayCost) {
        const parsedCost = parseFloat(storedTodayCost);
        setCurrentDayCost(isNaN(parsedCost) ? 0 : parsedCost);
    } else {
        setCurrentDayCost(0);
    }
    setLastRolloverCheck(startOfDay(new Date()));
  }, []);

  useEffect(() => { try { localStorage.setItem('powerping_usageSettings', JSON.stringify(usageSettings)); } catch(e) { console.error("Error saving usage settings to localStorage", e); }}, [usageSettings]);
  useEffect(() => { try { localStorage.setItem('powerping_appliances', JSON.stringify(appliances)); } catch(e) { console.error("Error saving appliances to localStorage", e); }}, [appliances]);
  useEffect(() => { try { localStorage.setItem('powerping_sleepMode', JSON.stringify(isSleepModeActive)); } catch(e) { console.error("Error saving sleep mode to localStorage", e); }}, [isSleepModeActive]);
  useEffect(() => { try { localStorage.setItem('powerping_dailyRecords', JSON.stringify(dailyRecords)); } catch(e) { console.error("Error saving daily records to localStorage", e); }}, [dailyRecords]);

  useEffect(() => {
    const todayKey = formatDateKey(new Date());
    try {
      localStorage.setItem(`powerping_currentDayKWh_${todayKey}`, currentDayKWh.toString());
      localStorage.setItem(`powerping_currentDayCost_${todayKey}`, currentDayCost.toString());
    } catch (e) {
      console.error("Error saving current day KWh/Cost to localStorage", e);
    }
  }, [currentDayKWh, currentDayCost]);

  const fetchAIData = useCallback(async () => {
    if (isSleepModeActive || appliancesRef.current.length === 0) {
      setEnergyPrediction(null);
      setPersonalizedTips([]);
      setIntelligentReminders([]);
      if (isSleepModeActive && appliancesRef.current.length > 0) {
        toast({ title: "Sleep Mode Active", description: "AI insights are paused." });
      }
      return;
    }
    const commonInputBase = {
      appliances: appliancesRef.current.map(a => ({
        deviceName: a.deviceName,
        room: a.room,
        powerRating: a.powerRating,
        estimatedDailyUsage: a.estimatedDailyUsage,
        status: a.status
      })),
      monthlyElectricityBillGoal: usageSettingsRef.current.monthlyElectricityBillGoal,
    };
    let allLoadedSuccessfully = true;
    setIsLoadingPrediction(true);
    try {
      const predictionResult = await predictEnergyUsage({ ...commonInputBase, currency: usageSettingsRef.current.currency });
      setEnergyPrediction({...predictionResult, currency: usageSettingsRef.current.currency});
    } catch (error) {
      console.error("Error fetching energy prediction:", error);
      toast({ title: "AI Error", description: "Could not fetch energy prediction.", variant: "destructive" });
      setEnergyPrediction(null);
      allLoadedSuccessfully = false;
    } finally { setIsLoadingPrediction(false); }
    setIsLoadingTips(true);
    try {
      const tipsResult = await generatePersonalizedTips(commonInputBase);
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
        appliances: appliancesRef.current.map(a => ({
            deviceName: a.deviceName,
            room: a.room,
            powerRating: a.powerRating,
            estimatedDailyUsage: a.estimatedDailyUsage
        })),
        monthlyElectricityBillGoal: usageSettingsRef.current.monthlyElectricityBillGoal,
      });
      setIntelligentReminders(remindersResult.reminderRules.map((rule, index) => ({ id: `reminder-${index}`, applianceName: rule.applianceName, rule: rule.rule })));
    } catch (error) {
      console.error("Error fetching intelligent reminders:", error);
      toast({ title: "AI Error", description: "Could not fetch intelligent reminders.", variant: "destructive" });
      setIntelligentReminders([]);
      allLoadedSuccessfully = false;
    } finally { setIsLoadingReminders(false); }
    if (allLoadedSuccessfully && !isSleepModeActive && appliancesRef.current.length > 0) {
        toast({ title: "AI Insights Updated", description: "Predictions, tips, and reminders are up to date." });
    }
  }, [isSleepModeActive, toast]);

  useEffect(() => { fetchAIData(); }, [fetchAIData, appliances, usageSettings.monthlyElectricityBillGoal, usageSettings.currency]);

  useEffect(() => {
    const checkAndRollover = () => {
      const now = new Date();
      if (!isSameDay(now, lastRolloverCheck)) {
        console.log("Midnight rollover detected. Saving previous day's data (using refs).");
        const previousDay = subDays(now, 1);
        const previousDayKey = formatDateKey(previousDay);
        setDailyRecords(prevRecords => ({
          ...prevRecords,
          [previousDayKey]: {
            totalKWh: currentDayKWhRef.current,
            totalCost: currentDayCostRef.current,
            currency: usageSettingsRef.current.currency,
          }
        }));
        setCurrentDayKWh(0);
        setCurrentDayCost(0);
        setLiveGraphData([]);
        timeCounterRef.current = 0;
        setLastRolloverCheck(startOfDay(now));
        toast({ title: "New Day Started", description: `Usage for ${format(previousDay, 'MMM d')} saved. Tracking for today.` });
        try {
          localStorage.removeItem(`powerping_currentDayKWh_${previousDayKey}`);
          localStorage.removeItem(`powerping_currentDayCost_${previousDayKey}`);
        } catch (e) {
          console.error("Error removing previous day's KWh/Cost from localStorage", e);
        }
      }
    };
    checkAndRollover(); 
    const intervalId = setInterval(checkAndRollover, MIDNIGHT_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [lastRolloverCheck, toast]);

  useEffect(() => {
    if (isSleepModeActive) {
        setCurrentWattage(0);
        return;
    }
    const interval = setInterval(() => {
      let totalWattage = 0;
      appliancesRef.current.forEach(app => { // Use ref here
        if (app.status) {
          const applianceSpecificWattage = getApplianceWattage(app);
          totalWattage += applianceSpecificWattage;
        }
      });
      const newCurrentWattage = parseFloat(totalWattage.toFixed(0));
      setCurrentWattage(newCurrentWattage);

      timeCounterRef.current += 1;
      setLiveGraphData(prevData => {
        const newDataPoint = { time: timeCounterRef.current, wattage: newCurrentWattage };
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > MAX_LIVE_GRAPH_POINTS ? updatedData.slice(-MAX_LIVE_GRAPH_POINTS) : updatedData;
      });

      const costPerKWh = usageSettingsRef.current.currency === '₹' ? 7 : 0.15; // Use ref
      const kWhForInterval = (newCurrentWattage / 1000) * (REALTIME_UPDATE_INTERVAL / (1000 * 60 * 60));
      setCurrentDayKWh(prev => prev + kWhForInterval);
      setCurrentDayCost(prev => prev + (kWhForInterval * costPerKWh));
    }, REALTIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [isSleepModeActive]); // Dependencies: isSleepModeActive. appliancesRef and usageSettingsRef are stable.

  const handleUsageSettingsSubmit = (data: UsageSettings) => { setUsageSettings(data); setIsUsageSettingsDialogOpen(false); toast({ title: "Success", description: "Usage settings saved!" }); };

  const handleApplianceSubmit = (data: ApplianceFormValues) => {
    if (editingAppliance) {
      setAppliances(appliances.map(app => app.id === editingAppliance.id ? { ...editingAppliance, ...data } : app));
      toast({ title: "Success", description: "Appliance updated!" });
    } else {
      const newAppliance: Appliance = {
        id: Date.now().toString(),
        ...data,
        powerRating: data.powerRating ? Number(data.powerRating) : undefined,
        // applianceType is removed
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
      toast({ title: "Sleep Mode Activated", description: "AI insights paused. Live stats continue, some controls may be limited." });
    } else {
      toast({ title: "Sleep Mode Deactivated", description: "System returning to normal. AI insights will refresh." });
      fetchAIData();
    }
  };

  const isAIDataLoading = isLoadingPrediction || isLoadingTips || isLoadingReminders;
  const hasInitialSetup = appliances.length > 0;

  const displayedMonthlyCost = useMemo(() => {
    let total = 0;
    const currentMonthValue = getMonth(new Date());
    const currentYearValue = getYear(new Date());
    Object.entries(dailyRecords).forEach(([dateKey, record]) => {
      if (record && typeof record.totalCost === 'number' && !isNaN(record.totalCost)) {
        try {
          const recordDate = parseISO(dateKey); 
          if (getMonth(recordDate) === currentMonthValue && getYear(recordDate) === currentYearValue) {
            total += record.totalCost;
          }
        } catch (e) {
            console.error("Error parsing dateKey in displayedMonthlyCost:", dateKey, e);
        }
      }
    });
     return total + (typeof currentDayCost === 'number' && !isNaN(currentDayCost) ? currentDayCost : 0);
  }, [dailyRecords, currentDayCost]);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
        <div className="flex items-center space-x-2">
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
            <p className="text-sm text-primary-foreground/80">Energy saving mode is on. AI insights may be paused and some controls limited. Live stats continue.</p>
         </CardContent>
        </Card>
      )}

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="flex-1 sm:flex-initial">
            <BarChart2 className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Dashboard</span>
             <span className="sm:hidden">Dash</span>
          </TabsTrigger>
          <TabsTrigger value="appliances" className="flex-1 sm:flex-initial">
            <Zap className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Appliances</span>
            <span className="sm:hidden">Devices</span>
          </TabsTrigger>
          <TabsTrigger value="livestats" className="flex-1 sm:flex-initial">
            <AlertCircle className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Live Stats</span>
             <span className="sm:hidden">Live</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex-1 sm:flex-initial">
            <Lightbulb className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Insights</span>
             <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-initial col-span-2 sm:col-span-1">
            <Settings className="h-4 w-4 sm:mr-2"/>
            <span className="hidden sm:inline">Settings</span>
             <span className="sm:hidden">Setup</span>
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
                        <CardHeader><CardTitle>Real-Time Features Paused</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Sleep mode is active. Some real-time dashboard features are paused.</p></CardContent>
                    </Card>
                 ) : (
                    <>
                        <EnergyConsumptionChart 
                          dailyRecords={dailyRecords} 
                          endDate={new Date()} 
                          currentDayKWh={currentDayKWh} 
                        />
                        <div>
                        <SectionTitle>Real-Time Feedback</SectionTitle>
                        {!isSleepModeActive ? (
                            appliances.some(app => app.status) ? (
                                <div className="space-y-3">
                                {appliances.filter(app => app.status).map(app => (
                                    <RealTimeFeedbackItem key={app.id} appliance={app} onToggleStatus={handleToggleApplianceStatus} />
                                ))}
                                </div>
                            ) : <p className="text-muted-foreground">No appliances are currently active.</p>
                        ) : <p className="text-muted-foreground">Real-time feedback is unavailable in sleep mode.</p>}
                        </div>
                    </>
                 )}
              </div>
              <div className="space-y-6">
                {isSleepModeActive ? (
                  <Card>
                    <CardHeader><CardTitle>AI Energy Prediction</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">
                      AI Predictions are paused in Sleep Mode.
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
                <CardHeader><CardTitle>Appliance Management Limited</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Appliance controls may be limited in Sleep Mode. You can still view your appliances.</p></CardContent>
            </Card>
           ) : null}
            <>
              <Button onClick={openAddApplianceForm} variant="default" className="mb-4 bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSleepModeActive}>
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
        </TabsContent>

        <TabsContent value="livestats">
          <SectionTitle>Energy Statistics</SectionTitle>
          {isSleepModeActive ? (
             <Card>
                <CardHeader><CardTitle>Live Stats Partially Paused</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Current Wattage may reflect sleep mode. Accumulated stats for today continue.</p></CardContent>
            </Card>
          ) : null }
          { hasInitialSetup || Object.keys(dailyRecords).length > 0 ? (
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
                  <CardTitle className="text-sm font-medium">Total Consumption (Today)</CardTitle>
                  <span className="text-muted-foreground">{usageSettings.currency}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageSettings.currency}{(typeof currentDayCost === 'number' && !isNaN(currentDayCost) ? currentDayCost : 0).toFixed(2)}</div>
                   <p className="text-xs text-muted-foreground">
                    {(typeof currentDayKWh === 'number' && !isNaN(currentDayKWh) ? currentDayKWh : 0).toFixed(2)} kWh accumulated today
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Est. Bill (This Month)</CardTitle>
                   <span className="text-muted-foreground">{usageSettings.currency}</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageSettings.currency}{displayedMonthlyCost.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Sum of recorded daily costs this month</p>
                </CardContent>
              </Card>
              <LiveWattageChart data={liveGraphData} />
            </div>
          ) : (
             <Card>
                <CardHeader><CardTitle>Statistics Unavailable</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Add appliances and use the app to see energy statistics.</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights">
           <SectionTitle>AI Insights</SectionTitle>
           {isSleepModeActive || !hasInitialSetup ? (
             <Card>
                <CardHeader><CardTitle>AI Insights Paused/Unavailable</CardTitle></CardHeader>
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
    
