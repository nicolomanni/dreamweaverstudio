import { Button, Card, CardBody } from '@dreamweaverstudio/client-ui';
import { formatNumber } from '../../utils/currency';

type RenderQueueProps = {
  locale?: string;
};

const RenderQueue = ({ locale = 'en-US' }: RenderQueueProps) => {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-foreground/50">
              Top product
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-foreground">
              Best performing issues
            </h3>
          </div>
          <Button variant="outline" size="sm">
            View all
          </Button>
        </div>
        <div className="mt-5 space-y-4">
          {[
            { title: 'Neon City Chronicles #6', change: 12.6 },
            { title: 'Glass District Noir #2', change: 8.4 },
            { title: 'Aetherline Prologue', change: 4.1 },
            { title: 'Pulse Neon Poster', change: 2.7 },
          ].map((job, index) => (
            <div
              key={`${job.title}-${index}`}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background" />
                <span className="text-sm font-medium text-slate-700 dark:text-foreground/80">
                  {job.title}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-500">
                {job.change >= 0 ? '+' : '-'}
                {formatNumber(Math.abs(job.change), locale, {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default RenderQueue;
