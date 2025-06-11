
// PowerPing Types
export interface Appliance {
  id: string;
  deviceName: string;
  room: string;
  // applianceType: string; // Removed
  powerRating?: number; // Optional, in Watts
  estimatedDailyUsage: number; // hours
  status: boolean; // On/Off
}

export interface UsageSettings {
  monthlyElectricityBillGoal: number;
  currency: '₹' | '$';
}

// AI related types - align with Genkit flow inputs/outputs

// Input for personalizedTipsFlow
export interface PersonalizedTipsGenAIInput {
  appliances: Array<{
    deviceName: string;
    room: string;
    // applianceType: string; // Removed
    powerRating?: number;
    estimatedDailyUsage: number;
    status: boolean;
  }>;
  monthlyElectricityBillGoal: number;
}

// Output for personalizedTipsFlow
export interface PersonalizedTipsGenAIOutput {
  tips: string[];
}

// Input for predictEnergyUsageFlow
export interface EnergyPredictionGenAIInput {
  appliances: Array<{
    deviceName: string;
    room: string;
    // applianceType: string; // Removed
    powerRating?: number;
    estimatedDailyUsage: number;
    status: boolean;
  }>;
  monthlyElectricityBillGoal: number;
  currency: '₹' | '$';
}

// Output for predictEnergyUsageFlow
export interface EnergyPredictionData {
  dailyEnergyUsagePrediction: number;
  monthlyEnergyUsagePrediction: number;
  estimatedDailyCost: number;
  estimatedMonthlyCost: number;
  isWithinGoal: boolean;
  currency: string; // Ensure currency is part of this type for display
}

// Input for generateReminderRulesFlow
export interface IntelligentRemindersGenAIInput {
  appliances: Array<{
    deviceName: string;
    room: string;
    // applianceType: string; // Removed
    powerRating?: number;
    estimatedDailyUsage: number;
  }>;
  monthlyElectricityBillGoal: number;
}

// Output for generateReminderRulesFlow
export interface IntelligentReminderRule {
  applianceName: string; // This can remain deviceName if preferred by AI
  rule: string;
}
export interface IntelligentRemindersGenAIOutput {
  reminderRules: IntelligentReminderRule[];
}


// Types for UI display (PowerPing specific)
export interface DisplayPersonalizedTip {
  id: string;
  text: string;
}

export interface DisplayIntelligentReminder {
  id: string;
  applianceName: string;
  rule: string;
}

export interface RealTimeDataPoint {
  time: number; // Represents a sequence or relative time for the graph
  wattage: number;
}

// New type for storing daily aggregated usage
export interface DailyUsageRecord {
  date: string; // YYYY-MM-DD
  totalKWh: number;
  totalCost: number;
  currency: '₹' | '$';
}

export type DailyRecords = Record<string, Omit<DailyUsageRecord, 'date'>>; // Keyed by YYYY-MM-DD date string
