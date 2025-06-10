
// Existing WattWatcher Types - these might be removed or adapted later
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
  currency: string;
}

// Input for generateReminderRulesFlow
export interface IntelligentRemindersGenAIInput {
  homeSize: HomeSize;
  numberOfRooms: number;
  appliances: Array<{
    deviceName: string;
    room: string;
    estimatedDailyUsage: number;
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


// Types for UI display (WattWatcher specific)
export interface DisplayPersonalizedTip {
  id: string;
  text: string;
}

export interface DisplayIntelligentReminder {
  id: string;
  applianceName: string;
  rule: string;
}


// New types for Airbnb-style UI
export interface Listing {
  id: string;
  imageUrl: string;
  imageHint?: string;
  title: string;
  location: string;
  rating: number;
  pricePerNight: number;
  currency: string;
}

// Add other types as needed for Search, Trips, Inbox, Profile pages
// For example:
// export interface Trip { ... }
// export interface Message { ... }
// export interface UserProfile { ... }
