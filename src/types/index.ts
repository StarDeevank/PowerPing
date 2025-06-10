export interface Appliance {
  id: string;
  deviceName: string;
  room: string;
  estimatedDailyUsage: number; // hours
  status: boolean; // On/Off
}

export type HomeSize = '1BHK' | '2BHK' | '3BHK' | '4BHK+' | '';

export interface HomeConfiguration {
  homeSize: HomeSize;
  numberOfRooms: number;
}

export interface UsageSettings {
  monthlyElectricityBillGoal: number;
  currency: '₹' | '$';
}

// AI related types - align with Genkit flow inputs/outputs

// Input for personalizedTipsFlow
export interface PersonalizedTipsGenAIInput {
  homeSize: HomeSize;
  numberOfRooms: number;
  appliances: Array<{
    deviceName: string;
    room: string;
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
  homeSize: HomeSize;
  numberOfRooms: number;
  appliances: Array<{
    deviceName: string;
    room: string;
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
  currency: string; // Ensure currency is part of the output structure if needed for display
}

// Input for generateReminderRulesFlow
export interface IntelligentRemindersGenAIInput {
  homeSize: HomeSize;
  numberOfRooms: number;
  appliances: Array<{
    deviceName: string;
    room: string;
    estimatedDailyUsage: number;
    // status is not in the AI input for reminders, but good to have in app state
  }>;
  monthlyElectricityBillGoal: number;
}

// Output for generateReminderRulesFlow
export interface IntelligentReminderRule {
  applianceName: string;
  rule: string;
}
export interface IntelligentRemindersGenAIOutput {
  reminderRules: IntelligentReminderRule[];
}


// Types for UI display
export interface DisplayPersonalizedTip {
  id: string;
  text: string;
}

export interface DisplayIntelligentReminder {
  id: string;
  applianceName: string;
  rule: string;
}
