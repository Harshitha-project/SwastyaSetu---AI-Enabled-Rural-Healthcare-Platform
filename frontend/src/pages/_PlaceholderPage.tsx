import { Card } from '../components/common';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
}

const PlaceholderPage = ({ title, description, icon = '🚧' }: PlaceholderPageProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="p-8 text-center max-w-md">
        <span className="text-6xl mb-4 block">{icon}</span>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500">{description || 'This page is under development and will be available soon.'}</p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
