import { useI18n } from '../i18n/index.jsx';
import { getFirmBalances, getMonthlyReport, getWeeklySales } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { usePeriod } from '../hooks/usePeriod.js';
import { monthTitle, money } from '../utils/format.js';
import MonthSwitcher from '../components/MonthSwitcher.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import ExpensesCard from '../components/ExpensesCard.jsx';
import ProfitBanner from '../components/ProfitBanner.jsx';
import FirmSharesCard from '../components/FirmSharesCard.jsx';
import WeeklyChart from '../components/WeeklyChart.jsx';
import DebtCard from '../components/DebtCard.jsx';

export default function ReportPage() {
  const { t } = useI18n();
  const { year, month, shift, isCurrent } = usePeriod();

  const { data, loading, error } = useAsync(
    async () => {
      const [report, weeks] = await Promise.all([
        getMonthlyReport(year, month),
        getWeeklySales(year, month),
      ]);
      return { report, weeks };
    },
    [year, month]
  );

  // Қарз аз моҳ новобаста аст. Агар хато шавад, ҳисобот бетағйир кор мекунад.
  const balances = useAsync(() => getFirmBalances(), []);

  const title = monthTitle(year, month);
  const report = data?.report;

  return (
    <>
      <MonthSwitcher label={title} onPrev={() => shift(-1)} onNext={() => shift(1)} nextDisabled={isCurrent} />

      {loading && <p className="state">{t('Бор карда истодааст…')}</p>}
      {error && <div className="state state-error">{error}</div>}

      {!loading && !error && report && (
        <>
          <SummaryCard revenue={report.totalRevenue} paidToFirms={report.totalPaidToFirms} />
          <ExpensesCard
            title={title}
            categories={report.expensesByCategory}
            paidToFirms={report.totalPaidToFirms}
            total={report.totalCosts}
          />
          <ProfitBanner netProfit={report.netProfit} isLoss={report.isLoss} />
          <FirmSharesCard title={title} firms={report.firmShares} />
          {balances.data && balances.data.firms.some((f) => f.totalPurchased > 0 || f.totalPaid > 0) && (
            <DebtCard balances={balances.data} />
          )}
          <WeeklyChart month={month} weeks={data.weeks} />

          <footer className="footer-bar">
            {t('Ҷамъи фурӯши моҳона')}: {money(report.totalRevenue)} · {t('Натиҷа')}: {money(report.netProfit)} (
            {report.isLoss ? t('ЗИЁН') : t('ФОИДА')})
          </footer>
        </>
      )}
    </>
  );
}
