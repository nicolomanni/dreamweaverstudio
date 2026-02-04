const RenderPerformance = () => {
  const countries = [
    { name: 'United States', value: '38.6%' },
    { name: 'Brazil', value: '27.9%' },
    { name: 'Japan', value: '22.4%' },
    { name: 'United Kingdom', value: '17.8%' },
    { name: 'Turkey', value: '12.4%' },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">
          Top regions
        </h3>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background">
          <div className="h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_70%)]" />
        </div>
        <div className="space-y-4">
          {countries.map((country) => (
            <div key={country.name} className="flex items-center justify-between">
              <span className="text-sm text-slate-700 dark:text-foreground/80">
                {country.name}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-foreground">
                {country.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RenderPerformance;
