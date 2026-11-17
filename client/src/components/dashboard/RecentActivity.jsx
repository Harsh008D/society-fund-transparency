
import { ArrowDownLeft, ArrowUpRight, Wallet, Receipt } from 'lucide-react';

function RecentActivity({
  activities,
  formatCurrency,
  onViewFunds,
  onViewExpenses,
}) {
  const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <section className="content-card recent-activity-card">
      <div className="recent-activity-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Your latest society financial transactions</p>
        </div>

        <div className="activity-filters">
          <button type="button" onClick={onViewFunds}>
            View funds
          </button>
          <button type="button" onClick={onViewExpenses}>
            View expenses
          </button>
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="recent-activity-list">
          {activities.map((item, index) => {
            const isFund = item.activityType === 'Fund';

            return (
              <div
                className="recent-activity-item"
                key={item._id || `${item.activityType}-${index}`}
              >
                <div className={`activity-type-icon ${isFund ? 'fund' : 'expense'}`}>
                  {isFund ? (
                    <ArrowDownLeft size={19} />
                  ) : (
                    <ArrowUpRight size={19} />
                  )}
                </div>

                <div className="recent-activity-info">
                  <strong>
                    {item.activityName || item.title || item.name || 'Untitled transaction'}
                  </strong>

                  <div className="recent-activity-meta">
                    <span className={`activity-type-label ${isFund ? 'fund' : 'expense'}`}>
                      {isFund ? <Wallet size={12} /> : <Receipt size={12} />}
                      {item.activityType}
                    </span>

                    {(item.type || item.category) && (
                      <span>{item.type || item.category}</span>
                    )}

                    <span>
                      {formatDate(item.date || item.createdAt)}
                    </span>
                  </div>

                  {item.description && (
                    <p className="recent-activity-description">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className={`recent-activity-amount ${isFund ? 'incoming' : 'outgoing'}`}>
                  <strong>
                    {isFund ? '+' : '−'}{formatCurrency(item.activityAmount)}
                  </strong>
                  <span>{isFund ? 'Money received' : 'Money spent'}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="recent-activity-empty">
          <div className="empty-activity-icon">
            <Wallet size={23} />
          </div>
          <strong>No transactions yet</strong>
          <p>New society funds and expenses will appear here.</p>
        </div>
      )}
    </section>
  );
}

export default RecentActivity;
