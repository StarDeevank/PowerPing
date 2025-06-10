import type { LucideProps } from 'lucide-react';
import { getApplianceIcon } from '@/config/appliance-icons';

interface ApplianceIconRendererProps extends Omit<LucideProps, 'name'> {
  deviceName: string;
}

const ApplianceIconRenderer: React.FC<ApplianceIconRendererProps> = ({ deviceName, ...props }) => {
  const IconComponent = getApplianceIcon(deviceName);
  return <IconComponent {...props} />;
};

export default ApplianceIconRenderer;
