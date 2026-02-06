import { Card, CardBody, HelperText } from '@dreamweaverstudio/client-ui';
import { formatCurrency, formatNumber } from '../../utils/currency';

type RecentActivityProps = {
  currency?: string;
  locale?: string;
};

const RecentActivity = ({
  currency = 'USD',
  locale = 'en-US',
}: RecentActivityProps) => {
  const stripePayout = formatCurrency(8450, currency, {}, locale);
  const creditsTopUp = formatNumber(1200, locale);

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              Recent Activity
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              Studio Timeline
            </h3>
          </div>
          <HelperText as="span">Last 24h</HelperText>
        </div>
        <div className="mt-6 space-y-4">
          {[
            {
              item: `Stripe payout scheduled for ${stripePayout}.`,
              time: '38m ago',
            },
            {
              item: 'Published “Neon City Chronicles · Issue 6”.',
              time: '1h ago',
            },
            {
              item: 'Client brief approved for “Glass District Noir”.',
              time: '2h ago',
            },
            {
              item: `AI credits replenished (+${creditsTopUp}).`,
              time: '3h ago',
            },
          ].map((entry, index) => (
            <Card
              key={`${entry.item}-${index}`}
              variant="muted"
              className="flex items-start gap-3 rounded-xl px-4 py-3"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm text-slate-700 dark:text-foreground/80">
                  {entry.item}
                </p>
                <p className="text-xs text-slate-500 dark:text-foreground/50">
                  {entry.time}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default RecentActivity;
