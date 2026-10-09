import React from 'react';
import {
  GraduationCap,
  Building2,
  Home,
  BookOpen,
  FlaskConical,
  UtensilsCrossed,
  Bus,
  Zap,
  Droplets,
  Wifi,
  ShieldCheck,
  FileText,
  HelpCircle,
  AlertCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  iconName?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, ...props }) => {
  switch (iconName) {
    case 'GraduationCap':
      return <GraduationCap {...props} />;
    case 'Building2':
      return <Building2 {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'FlaskConical':
      return <FlaskConical {...props} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed {...props} />;
    case 'Bus':
      return <Bus {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Droplets':
      return <Droplets {...props} />;
    case 'Wifi':
      return <Wifi {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'FileText':
      return <FileText {...props} />;
    case 'AlertCircle':
      return <AlertCircle {...props} />;
    default:
      return <HelpCircle {...props} />;
  }
};
