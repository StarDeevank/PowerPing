import type { LucideIcon } from 'lucide-react';
import { AirVent, Bath, FanIcon, Lightbulb, Refrigerator, Router, ShowerHead, Speaker, Tv2, WashingMachine, Wind, Zap, PlugZap, Thermometer, Heater, Coffee, Laptop, Microwave, Gamepad2, VenetianMask } from 'lucide-react';

export const applianceIconMap: Record<string, LucideIcon> = {
  default: Zap,
  ac: AirVent,
  'air conditioner': AirVent,
  airconditioner: AirVent,
  bath: Bath,
  geyser: ShowerHead,
  'water heater': Heater,
  heater: Heater,
  fan: Wind, // FanIcon might not be ideal, Wind is more abstract
  light: Lightbulb,
  lightbulb: Lightbulb,
  lamp: Lightbulb,
  refrigerator: Refrigerator,
  fridge: Refrigerator,
  router: Router,
  modem: Router,
  speaker: Speaker,
  'sound system': Speaker,
  tv: Tv2,
  television: Tv2,
  'washing machine': WashingMachine,
  washer: WashingMachine,
  plug: PlugZap,
  outlet: PlugZap,
  thermometer: Thermometer,
  thermostat: Thermometer,
  coffee: Coffee,
  'coffee maker': Coffee,
  laptop: Laptop,
  computer: Laptop,
  desktop: Laptop,
  microwave: Microwave,
  oven: Microwave, // Or a more specific oven icon if available
  console: Gamepad2,
  'game console': Gamepad2,
  blinds: VenetianMask,
  'electric blinds': VenetianMask,
};

export const getApplianceIcon = (deviceName: string): LucideIcon => {
  const normalizedDeviceName = deviceName.toLowerCase().trim();
  for (const key in applianceIconMap) {
    if (normalizedDeviceName.includes(key)) {
      return applianceIconMap[key];
    }
  }
  return applianceIconMap.default;
};
