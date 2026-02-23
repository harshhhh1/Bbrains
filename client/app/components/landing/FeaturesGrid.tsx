import DarkModeProductCard from '../widgets/DarkModeProductCard';
import DailyRewardCard from '../widgets/DailyRewardCard';
import ActivityFeed from '../widgets/ActivityFeed';
import UpcomingDeadline from '../widgets/UpcomingDeadline';
import FeatureCard from './FeatureCard';
import { Feature } from '@/app/config/features';

interface FeaturesGridProps {
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
  coins: number;
  DARK_MODE_PRICE: number;
  isDarkModeUnlocked: boolean;
  purchaseDarkMode: () => void;
  DAILY_POINTS: number;
  dailyClaimed: boolean;
  claimDailyPoints: () => void;
  features: Feature[];
  setSelectedFeature: (feature: Feature) => void;
  highlightDaily: boolean;
  highlightDarkMode: boolean;
}

const FeaturesGrid: React.FC<FeaturesGridProps> = ({
  isDarkMode,
  iconColor,
  specialEliteFont,
  coins,
  DARK_MODE_PRICE,
  isDarkModeUnlocked,
  purchaseDarkMode,
  DAILY_POINTS,
  dailyClaimed,
  claimDailyPoints,
  features,
  setSelectedFeature,
  highlightDaily,
  highlightDarkMode
}) => (
  <div className="lg:col-span-7 grid grid-cols-2 gap-3 auto-rows-min content-center">
    <DarkModeProductCard {...{ isDarkMode, iconColor, specialEliteFont, DARK_MODE_PRICE, isDarkModeUnlocked, coins, purchaseDarkMode }} highlight={highlightDarkMode} />
    <DailyRewardCard     {...{ isDarkMode, iconColor, specialEliteFont, DAILY_POINTS, dailyClaimed, claimDailyPoints }} highlight={highlightDaily} />
    <ActivityFeed        {...{ isDarkMode, iconColor }} />
    <UpcomingDeadline isDarkMode={isDarkMode} />
    {features.map((feature) => (
      <FeatureCard key={feature.id} {...{ feature, isDarkMode, iconColor, specialEliteFont }} onClick={() => setSelectedFeature(feature)} />
    ))}
    <FeatureCard feature={null} {...{ isDarkMode, iconColor, specialEliteFont }} />
  </div>
);

export default FeaturesGrid;
