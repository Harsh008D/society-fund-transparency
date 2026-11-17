import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } from "recharts";
  
  function FinancialOverview({ funds, expenses, formatCurrency }) {
    const now = new Date();
  
    // Prepare the last six calendar months
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
  
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        month: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        funds: 0,
        expenses: 0,
      };
    });
  
    const monthMap = new Map(months.map((month) => [month.key, month]));
  
    funds.forEach((fund) => {
      const date = new Date(fund.date || fund.createdAt);
      if (Number.isNaN(date.getTime())) return;
  
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
  
      const month = monthMap.get(key);
  
      if (month) {
        month.funds += Number(fund.amount || 0);
      }
    });
  
    expenses.forEach((expense) => {
      const date = new Date(expense.date || expense.createdAt);
      if (Number.isNaN(date.getTime())) return;
  
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
  
      const month = monthMap.get(key);
  
      if (month) {
        month.expenses += Number(expense.amount || 0);
      }
    });
  
    const hasData = months.some((month) => month.funds > 0 || month.expenses > 0);
  
    const activeMonths = months.filter(
      (month) => month.funds > 0 || month.expenses > 0
    );
  
    const latestMonth = activeMonths[activeMonths.length - 1];
    const previousMonth = activeMonths[activeMonths.length - 2];
  
    const getTrend = (current, previous) => {
      if (!latestMonth || !previousMonth) {
        return "More history needed";
      }
  
      if (previous === 0) {
        return current > 0 ? "New activity" : "No change";
      }
  
      const change = ((current - previous) / previous) * 100;
  
      return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
    };
  
    const compactCurrency = (value) => {
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
      if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
      return `₹${value}`;
    };
  
    return (
      <section className="financial-overview content-card">
        <div className="financial-overview-header">
          <div className="financial-trends">
            <span>
              Funds trend:
              <strong>
                {getTrend(latestMonth?.funds, previousMonth?.funds)}
              </strong>
            </span>
  
            <span>
              Expenses trend:
              <strong>
                {getTrend(latestMonth?.expenses, previousMonth?.expenses)}
              </strong>
            </span>
          </div>
  
          <div>
            <h2>Financial Overview</h2>
            <p>Monthly funds collected vs expenses</p>
          </div>
  
          <span className="chart-period">Last 6 months</span>
        </div>
  
        {hasData ? (
          <div className="financial-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months}
                margin={{ top: 15, right: 10, left: 5, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="4 4"
                  vertical={false}
                />
  
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
  
                <YAxis
                  tickFormatter={compactCurrency}
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
  
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "10px",
                    color: "var(--color-text)",
                  }}
                />
  
                <Bar
                  dataKey="funds"
                  name="Funds"
                  fill="#729B8E"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={34}
                />
  
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#C5A77B"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={34}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="financial-chart-legend">
              <span>
                <i className="legend-dot funds-dot" />
                Funds
              </span>
              <span>
                <i className="legend-dot expenses-dot" />
                Expenses
              </span>
            </div>
          </div>
        ) : (
          <div className="chart-empty">
            <p>No dated financial records available yet.</p>
            <span>Monthly activity will appear here once records are added.</span>
          </div>
        )}
      </section>
    );
  }
  
  export default FinancialOverview;
  