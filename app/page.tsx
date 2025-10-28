import AuthenticityDashboard from '../components/AuthenticityDashboard';
import { accountProfiles } from '../components/lib/accounts';

export default function HomePage() {
  return <AuthenticityDashboard accounts={accountProfiles} />;
}
