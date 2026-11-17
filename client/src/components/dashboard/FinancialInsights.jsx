import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "../../styles/financial-insights.css";

const CATEGORY_COLORS = [
  "#54877D",
  "#C5A77B",
  "#668BA0",
  "#9B8AC4",
  "#D78A85",
  "#8A9B70",
  "#6E91B5",
  "#B58A6A",
];

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function sumForMonth(records, monthKey) {
  return records.reduce((total, record) => {
    const date = new Date(record.date || record.createdAt);
    if (Number.isNaN(date.getTime()) || getMonthKey(date) !== monthKey) {
      return total;
    }
    return total + Number(record.amount || 0);
  }, 0);
}

function formatPercentChange(current, previous) {
  if (previous === 0) return current > 0 ? "New activity" : "No change";
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.abs(change).toFixed(1);
  return `${change > 0 ? "+" : change < 0 ? "−" : ""}${rounded}%`;
}

function FinancialInsights({ funds, expenses, formatCurrency }) {
  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(previousMonthDate);

  const currentFunds = sumForMonth(funds, currentMonthKey);
  const previousFunds = sumForMonth(funds, previousMonthKey);
  const currentExpenses = sumForMonth(expenses, currentMonthKey);
  const previousExpenses = sumForMonth(expenses, previousMonthKey);

  const currentMonthLabel = now.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const previousMonthLabel = previousMonthDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const categoryTotals = expenses.reduce((totals, expense) => {
    const category = String(expense.category || "Uncategorized").trim() || "Uncategorized";
    totals[category] = (totals[category] || 0) + Number(expense.amount || 0);
    return totals;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalFunds = funds.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = totalFunds - totalExpenses;
  const expenseRatio = totalFunds > 0 ? (totalExpenses / totalFunds) * 100 : null;

  let healthLabel = "Insufficient data";
  let healthDescription = "Record funds to calculate your society's financial health.";
  let healthTone = "neutral";

  if (totalFunds > 0) {
    if (balance < 0 || expenseRatio > 90) {
      healthLabel = "Needs attention";
      healthDescription = "Expenses are very high compared with recorded funds.";
      healthTone = "danger";
    } else if (expenseRatio >= 70) {
      healthLabel = "Watch closely";
      healthDescription = "A large share of recorded funds has been spent.";
      healthTone = "warning";
    } else {
      healthLabel = "Healthy balance";
      healthDescription = "Recorded expenses are within a moderate share of funds.";
      healthTone = "good";
    }
  }

  const comparisonItems = [
    {
      label: "Funds collected",
      current: currentFunds,
      previous: previousFunds,
      change: formatPercentChange(currentFunds, previousFunds),
      tone: "fund",
    },
    {
      label: "Expenses recorded",
      current: currentExpenses,
      previous: previousExpenses,
      change: formatPercentChange(currentExpenses, previousExpenses),
      tone: "expense",
    },
  ];

  return (
    <section className="financial-insights-grid" aria-label="Financial insights">
      <article className="content-card insight-card monthly-comparison-card">
        <div className="insight-heading">
          <div>
            <h2>Monthly comparison</h2>
            <p>{currentMonthLabel} compared with {previousMonthLabel}</p>
          </div>
          <span className="insight-period">Month to date</span>
        </div>

        <div className="comparison-list">
          {comparisonItems.map((item) => (
            <div className="comparison-item" key={item.label}>
              <div className="comparison-item-top">
                <span className={`comparison-indicator ${item.tone}`} />
                <strong>{item.label}</strong>
                <span className="comparison-change">{item.change}</span>
              </div>
              <div className="comparison-values">
                <div>
                  <span>This month</span>
                  <strong>{formatCurrency(item.current)}</strong>
                </div>
                <div>
                  <span>Previous month</span>
                  <strong>{formatCurrency(item.previous)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="insight-footnote">The comparison uses calendar-month dates from your saved records.</p>
      </article>

      <article className="content-card insight-card expense-breakdown-card">
        <div className="insight-heading">
          <div>
            <h2>Expense breakdown</h2>
            <p>Recorded spending by category</p>
          </div>
        </div>

        {categoryData.length > 0 ? (
          <div className="expense-breakdown-content">
            <div className="expense-donut-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "10px",
                      color: "var(--color-text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="expense-donut-total">
                <span>Total spent</span>
                <strong>{formatCurrency(totalExpenses)}</strong>
              </div>
            </div>

            <div className="expense-category-list">
              {categoryData.map((item, index) => {
                const share = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
                return (
                  <div className="expense-category-row" key={item.name}>
                    <span
                      className="category-color-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                    />
                    <span className="expense-category-name">{item.name}</span>
                    <strong>{share.toFixed(1)}%</strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="insight-empty-state">
            <strong>No expense categories yet</strong>
            <span>Category totals will appear after expenses are recorded.</span>
          </div>
        )}
      </article>

      <article className="content-card insight-card financial-health-card">
        <div className="insight-heading">
          <div>
            <h2>Financial health</h2>
            <p>Based on all recorded funds and expenses</p>
          </div>
        </div>

        <div className={`health-status ${healthTone}`}>
          <span className="health-status-dot" />
          <strong>{healthLabel}</strong>
        </div>

        <div className="health-balance-block">
          <span>Available balance</span>
          <strong className={balance < 0 ? "negative-balance" : ""}>{formatCurrency(balance)}</strong>
        </div>

        <div className="health-ratio-heading">
          <span>Funds spent</span>
          <strong>{expenseRatio === null ? "Not available" : `${expenseRatio.toFixed(1)}%`}</strong>
        </div>
        <div className="health-progress-track">
          <div
            className={`health-progress-fill ${healthTone}`}
            style={{ width: `${Math.min(expenseRatio ?? 0, 100)}%` }}
          />
        </div>
        <p className="health-description">{healthDescription}</p>
        <p className="insight-footnote">This is a simple indicator, not an accounting or audit assessment.</p>
      </article>
    </section>
  );
}

export default FinancialInsights;
