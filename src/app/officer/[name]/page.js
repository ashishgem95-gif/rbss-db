import officersData from '../../../../public/data/officers.json';
import OfficerProfileClient from './OfficerProfileClient';

export function generateStaticParams() {
  const uniqueNames = [...new Set(officersData.map(o => o.name))];
  return uniqueNames.map(name => ({ name }));
}

export default function OfficerProfilePage({ params }) {
  return <OfficerProfileClient name={params.name} />;
}
