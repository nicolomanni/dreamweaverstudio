import { Card, CardBody, HelperText } from '@dreamweaverstudio/client-ui';
import { formatCurrencyCompact, formatNumber } from '../../utils/currency';

type UpcomingTasksProps = {
  currency?: string;
  locale?: string;
};

const UpcomingTasks = ({ currency = 'USD', locale = 'en-US' }: UpcomingTasksProps) => {
  const currentAmount = 58400;
  const targetAmount = 78000;
  const progressPercent = 75;
  const growthPercent = 12;

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Sales target
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-foreground/60">
            Monthly
          </span>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-200 text-sm font-semibold text-slate-700 dark:border-border dark:text-foreground">
            {formatNumber(progressPercent, locale)}%
            <span className="absolute inset-1 rounded-full border-4 border-primary/40" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-foreground">
              {formatCurrencyCompact(currentAmount, currency, locale)}
            </p>
            <HelperText>
              Target {formatCurrencyCompact(targetAmount, currency, locale)} • +
              {formatNumber(growthPercent, locale)}% this month
            </HelperText>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default UpcomingTasks;
