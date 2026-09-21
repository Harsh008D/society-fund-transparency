import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'
import Signup from './Signup'
import SocietyRegister from './SocietyRegister'

function exportReportsCSV(funds, expenses) {
  const rows = [
    ["Type", "Title", "Amount", "Date"],
    ...funds.map((f) => [
      "Fund",
      f.title || f.description || "Fund",
      f.amount,
      f.date || "",
    ]),
    ...expenses.map((e) => [
      "Expense",
      e.title || e.description || "Expense",
      e.amount,
      e.date || "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "society-fund-report.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function App() {
  const [token, setToken] = useState(
    localStorage.getItem('token')
  )
  const [currentUser, setCurrentUser] = useState(null)
  const [society, setSociety] = useState(null)
  const [societyLoading, setSocietyLoading] = useState(true)
  const [showSignup, setShowSignup] = useState(false)
  const [showSocietyRegister, setShowSocietyRegister] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [funds, setFunds] = useState([])
  const [expenses, setExpenses] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [fundsLoading, setFundsLoading] = useState(true)
  const [fundsError, setFundsError] = useState('')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [invitationExpiry, setInvitationExpiry] = useState(7)
  const [invitationMaxUses, setInvitationMaxUses] = useState(5)
  const [invitationLoading, setInvitationLoading] = useState(false)
  const [invitationError, setInvitationError] = useState('')
  const [fundName, setFundName] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState('');
  const [fundDescription, setFundDescription] = useState('');
  const [fundDate, setFundDate] = useState('');
  const [fundSubmitError, setFundSubmitError] = useState('');
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('')
  const [reportEndDate, setReportEndDate] = useState('')
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editExpenseTitle, setEditExpenseTitle] = useState('');
  const [editExpenseAmount, setEditExpenseAmount] = useState('');
  const [editExpenseCategory, setEditExpenseCategory] = useState('');
  const [editExpenseDescription, setEditExpenseDescription] = useState('');
  const [editingFundId, setEditingFundId] = useState(null);
  const [editFundForm, setEditFundForm] = useState({
    name: "",
    amount: "",
    type: "",
    description: "",
    date: "",
  });

  // Your existing society ID
  const societyId = society?._id


  // Fetch logged-in user's profile and society
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setCurrentUser(null)
        setSociety(null)
        setSocietyLoading(false)
        return
      }

      setSocietyLoading(true)

      try {
        const response = await fetch(
          'http://localhost:5050/api/auth/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || 'Could not load profile'
          )
        }

        setCurrentUser(data.user)
        setSociety(data.user.society)
      } catch (error) {
        setDataError(error.message)
      } finally {
        setSocietyLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  const handleAddFund = async (e) => {
    e.preventDefault();
    setFundSubmitError('');
    setFundSubmitting(true);

    try {
      const response = await fetch('http://localhost:5050/api/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fundName,
          amount: Number(fundAmount),
          type: fundType,
          description: fundDescription,
          date: fundDate || new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not add fund');
      }

      setFunds((prev) => [data.fund, ...prev]);

      setFundName('');
      setFundAmount('');
      setFundType('');
      setFundDescription('');
      setFundDate('');
    } catch (error) {
      setFundSubmitError(error.message);
    } finally {
      setFundSubmitting(false);
    }
  };

  const handleEditFundChange = (e) => {
    const { name, value } = e.target;

    setEditFundForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEditFund = (fund) => {
    setEditingFundId(fund._id);

    setEditFundForm({
      name: fund.name || "",
      amount: fund.amount ?? "",
      type: fund.type || "",
      description: fund.description || "",
      date: fund.date ? new Date(fund.date).toISOString().slice(0, 10) : "",
    });
  };

  const cancelEditFund = () => {
    setEditingFundId(null);
  };

  const handleUpdateFund = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5050/api/funds/${editingFundId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...editFundForm,
            amount: Number(editFundForm.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update fund");
      }

      setFunds((prev) =>
        prev.map((fund) =>
          fund._id === editingFundId ? data.fund : fund
        )
      );

      setEditingFundId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteFund = async (fundId) => {
    if (!window.confirm("Are you sure you want to delete this fund?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5050/api/funds/${fundId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete fund");
      }

      setFunds((prev) => prev.filter((fund) => fund._id !== fundId));
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      // Wait until we know which society to load
      if (!token || !societyId) {
        setFunds([])
        setExpenses([])
        setDataLoading(false)
        return
      }
      setDataLoading(true)
      setDataError('')

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        }

        const [fundsResponse, expensesResponse] = await Promise.all([
          fetch(`http://localhost:5050/api/funds/${societyId}`, {
            headers,
          }),
          fetch(`http://localhost:5050/api/expenses/${societyId}`, {
            headers,
          }),
        ])

        const fundsData = await fundsResponse.json()
        const expensesData = await expensesResponse.json()

        if (!fundsResponse.ok) {
          throw new Error(fundsData.message || 'Could not load funds')
        }

        if (!expensesResponse.ok) {
          throw new Error(expensesData.message || 'Could not load expenses')
        }

        setFunds(Array.isArray(fundsData) ? fundsData : fundsData.funds || [])
        setExpenses(
          Array.isArray(expensesData)
            ? expensesData
            : expensesData.expenses || []
        )
      } catch (error) {
        setDataError(error.message || 'Failed to load financial data')
      } finally {
        setDataLoading(false)
      }
    }

    fetchFinancialData()
  }, [token, societyId])

  const totalFunds = funds.reduce(
    (total, fund) => total + Number(fund.amount || 0),
    0
  )

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  )

  const availableBalance = totalFunds - totalExpenses

  const getDateKey = (date) => {
    if (!date) return ''
    const d = new Date(date)

    if (Number.isNaN(d.getTime())) return ''

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const isWithinReportRange = (date) => {
    const dateKey = getDateKey(date)

    if (!dateKey) return false
    if (reportStartDate && dateKey < reportStartDate) return false
    if (reportEndDate && dateKey > reportEndDate) return false

    return true
  }

  const filteredFunds = funds.filter((fund) =>
    isWithinReportRange(fund.date)
  )

  const filteredExpenses = expenses.filter((expense) =>
    isWithinReportRange(expense.date)
  )

  const reportTotalFunds = filteredFunds.reduce(
    (total, fund) => total + Number(fund.amount || 0),
    0
  )

  const reportTotalExpenses = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  )

  const reportAvailableBalance =
    reportTotalFunds - reportTotalExpenses

  const recentActivities = [
    ...funds.map((fund) => ({
      ...fund,
      activityType: 'Fund',
      activityName: fund.name,
      activityAmount: Number(fund.amount || 0),
    })),
    ...expenses.map((expense) => ({
      ...expense,
      activityType: 'Expense',
      activityName: expense.title,
      activityAmount: Number(expense.amount || 0),
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
    )
    .slice(0, 5)

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setCurrentUser(null)
    setSociety(null)
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:5050/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: expenseTitle,
          amount: Number(expenseAmount),
          category: expenseCategory,
          description: expenseDescription,
          society: societyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not add expense')
      }

      setExpenses((prev) => [data.expense, ...prev])
      setExpenseTitle('')
      setExpenseAmount('')
      setExpenseCategory('')
      setExpenseDescription('')
    } catch (error) {
      setDataError(error.message)
    }
  }

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setEditExpenseTitle(expense.title || expense.name || '');
    setEditExpenseAmount(expense.amount || '');
    setEditExpenseCategory(expense.category || '');
    setEditExpenseDescription(expense.description || '');
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5050/api/expenses/${editingExpenseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editExpenseTitle,
            amount: Number(editExpenseAmount),
            category: editExpenseCategory,
            description: editExpenseDescription,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update expense');
      }

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === editingExpenseId ? data.expense : expense
        )
      );

      setEditingExpenseId(null);
      setEditExpenseTitle('');
      setEditExpenseAmount('');
      setEditExpenseCategory('');
      setEditExpenseDescription('');
    } catch (error) {
      setDataError(error.message);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this expense?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5050/api/expenses/${expenseId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete expense');
      }

      setExpenses((prev) =>
        prev.filter((expense) => expense._id !== expenseId)
      );
    } catch (error) {
      setDataError(error.message);
    }
  };

  const handleGenerateInvitation = async (e) => {
    e.preventDefault()

    setInvitationLoading(true)
    setInvitationError('')
    setInvitationCode('')

    try {
      const response = await fetch(
        'http://localhost:5050/api/invitations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            expiresInDays: Number(invitationExpiry),
            maxUses: Number(invitationMaxUses),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not generate code')
      }

      setInvitationCode(data.invitation.code)
    } catch (error) {
      setInvitationError(error.message)
    } finally {
      setInvitationLoading(false)
    }
  }

  if (!token) {
    if (showSocietyRegister) {
      return (
        <SocietyRegister
          onRegister={handleLogin}
          onBackToLogin={() => setShowSocietyRegister(false)}
        />
      )
    }

    if (showSignup) {
      return (
        <Signup
          onRegister={handleLogin}
          onBackToLogin={() => setShowSignup(false)}
        />
      )
    }

    return (
      <Login
        onLogin={handleLogin}
        onSignupClick={() => setShowSignup(true)}
        onSocietyRegisterClick={() => setShowSocietyRegister(true)}
      />
    )
  }
  const menuItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'Funds', icon: '₹' },
    { name: 'Expenses', icon: '↗' },
    { name: 'Reports', icon: '📊' },
    { name: 'Society', icon: '⌂' },
    ...(currentUser?.role === 'admin'
      ? [{ name: 'Manage Invitations', icon: '✉' }]
      : []),
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>Society<span>Fund</span></h2>
            <p>TRANSPARENCY PORTAL</p>
          </div>
        </div>

        <p className="menu-label">MENU</p>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? 'active' : ''
                }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <strong>{currentUser?.name || 'User'}</strong>
            <p>{currentUser?.role === 'admin' ? 'Society Admin' : 'Resident'}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Society Portal / {activePage}</p>
            <h1>{activePage}</h1>
          </div>
          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>Member Portal</span>
            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        {activePage === 'Dashboard' && (
          <>
            <section className="welcome">
              <div>
                <p className="eyebrow">
                  {currentUser?.role === 'admin'
                    ? 'ADMIN OVERVIEW'
                    : 'RESIDENT OVERVIEW'}
                </p>

                <h2>
                  Welcome, {currentUser?.name || 'User'} 👋
                </h2>

                <p>
                  {currentUser?.role === 'admin'
                    ? 'Manage your society finances, track expenses, and keep residents informed.'
                    : 'View your society funds, track expenses, and stay informed about financial activity.'}
                </p>
              </div>
              <div className="welcome-icon">₹</div>
            </section>

            {dataLoading && <p>Loading financial data...</p>}

            {dataError && (
              <p className="login-error">{dataError}</p>
            )}

            <section className="stats-grid">
              <div
                className="stat-card clickable-card"
                onClick={() => setActivePage('Funds')}
              >
                <div className="stat-top">
                  <span>Total Funds</span>
                  <span className="stat-icon purple">₹</span>
                </div>
                <h2>{formatCurrency(totalFunds)}</h2>
                <p>Recorded society funds</p>
              </div>

              <div
                className="stat-card clickable-card"
                onClick={() => setActivePage('Expenses')}
              >
                <div className="stat-top">
                  <span>Total Expenses</span>
                  <span className="stat-icon orange">↗</span>
                </div>
                <h2>{formatCurrency(totalExpenses)}</h2>
                <p>Recorded society expenses</p>
              </div>

              <div
                className="stat-card clickable-card"
                onClick={() => setActivePage('Funds')}
              >
                <div className="stat-top">
                  <span>Available Balance</span>
                  <span className="stat-icon green">✓</span>
                </div>
                <h2>{formatCurrency(availableBalance)}</h2>
                <p>Funds minus expenses</p>
              </div>
            </section>

            {currentUser?.role === 'admin' ? (
              <section className="content-card">
                <div className="section-heading">
                  <div>
                    <h2>Admin Quick Actions</h2>
                    <p>Manage your society's financial records.</p>
                  </div>
                </div>

                <div className="quick-actions">
                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Expenses')}
                  >
                    Add Expense
                  </button>

                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Manage Invitations')}
                  >
                    Manage Invitations
                  </button>
                </div>
              </section>
            ) : (
              <section className="content-card resident-overview">
                <div className="section-heading">
                  <div>
                    <h2>Your Society Overview</h2>
                    <p>
                      View your society's financial records and stay informed.
                    </p>
                  </div>
                </div>

                <div className="quick-actions">
                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Funds')}
                  >
                    View Funds
                  </button>

                  <button
                    className="primary-button"
                    onClick={() => setActivePage('Expenses')}
                  >
                    View Expenses
                  </button>
                </div>
              </section>
            )}

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest financial updates from your society</p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setActivePage('Funds')}
                >
                  View funds →
                </button>
              </div>

              {[...funds, ...expenses].length > 0 ? (
                [...funds.map(item => ({ ...item, kind: 'Fund' })),
                ...expenses.map(item => ({ ...item, kind: 'Expense' }))]
                  .slice(0, 5)
                  .map((item, index) => (
                    <div className="activity-row" key={item._id || index}>
                      <div className="activity-icon">₹</div>

                      <div className="activity-details">
                        <strong>{item.name || item.title}</strong>
                        <p>{item.description || item.kind}</p>
                      </div>

                      <div className="activity-amount">
                        <strong>{formatCurrency(item.amount)}</strong>
                        <p>{item.kind}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="empty-activity">
                  <span>✓</span>
                  <p>You're all caught up!</p>
                  <small>New financial activity will appear here.</small>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === 'Funds' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Society Funds</h2>
                <p>View funds collected by your society.</p>
              </div>
            </div>

            {currentUser?.role === 'admin' && (
              <form className="fund-form-card" onSubmit={handleAddFund}>
                <div className="fund-form-heading">
                  <div>
                    <h3>Record Collected Funds</h3>
                    <p>Add a new contribution to your society funds.</p>
                  </div>
                  <span className="fund-form-icon">₹</span>
                </div>

                <div className="fund-form-grid">
                  <input
                    type="text"
                    placeholder="Fund name"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    min="0.01"
                    step="0.01"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    required
                  />

                  <select
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value)}
                    required
                  >
                    <option value="">Select fund type</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="donations">Donations</option>
                    <option value="utilities">Utilities</option>
                    <option value="events">Events</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="date"
                    value={fundDate}
                    onChange={(e) => setFundDate(e.target.value)}
                  />

                  <textarea
                    className="fund-description"
                    placeholder="Add a short description (optional)"
                    value={fundDescription}
                    onChange={(e) => setFundDescription(e.target.value)}
                  />
                </div>

                {fundSubmitError && (
                  <p className="fund-form-error">{fundSubmitError}</p>
                )}

                <div className="fund-form-footer">
                  <span>Only society admins can record funds.</span>
                  <button type="submit" disabled={fundSubmitting}>
                    {fundSubmitting ? 'Adding...' : '＋ Add Fund'}
                  </button>
                </div>
              </form>
            )}

            {fundsError && <p>{fundsError}</p>}

            {funds.length === 0 && !fundsError && (
              <p className="coming-soon">No fund records found.</p>
            )}

            {funds.map((fund) => (
              <div className="activity-row" key={fund._id}>
                <div className="activity-icon">₹</div>

                <div className="activity-details">
                  <strong>{fund.name}</strong>
                  <p>{fund.type} · {fund.description}</p>
                </div>

                <div className="activity-amount">
                  <strong>₹{Number(fund.amount).toLocaleString("en-IN")}</strong>
                  <p>
                    {fund.date
                      ? new Date(fund.date).toLocaleDateString("en-IN")
                      : ""}
                  </p>
                </div>

                {currentUser?.role === "admin" && (
                  <div className="expense-actions">
                    <button type="button" onClick={() => startEditFund(fund)}>
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFund(fund._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {editingFundId === fund._id && (
                  <form className="edit-record-form" onSubmit={handleUpdateFund}>
                    <input
                      name="name"
                      value={editFundForm.name}
                      onChange={handleEditFundChange}
                      placeholder="Fund name"
                      required
                    />

                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editFundForm.amount}
                      onChange={handleEditFundChange}
                      placeholder="Amount"
                      required
                    />

                    <select
                      name="type"
                      value={editFundForm.type}
                      onChange={handleEditFundChange}
                      required
                    >
                      <option value="">Select fund type</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="donations">Donations</option>
                      <option value="utilities">Utilities</option>
                      <option value="events">Events</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      name="date"
                      type="date"
                      value={editFundForm.date}
                      onChange={handleEditFundChange}
                    />

                    <textarea
                      name="description"
                      value={editFundForm.description}
                      onChange={handleEditFundChange}
                      placeholder="Description"
                    />

                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={cancelEditFund}>
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            ))}
          </section>
        )}

        {activePage === 'Expenses' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Society Expenses</h2>
                <p>View expenses recorded by your society.</p>
              </div>
            </div>

            {dataError && <p>{dataError}</p>}

            {currentUser?.role === 'admin' && (
              <form className="expense-form" onSubmit={handleAddExpense}>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Expense title"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  required
                />

                <input
                  className="form-control"
                  type="number"
                  placeholder="Amount (₹)"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  min="1"
                  required
                />

                <select
                  className="form-control"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Security">Security</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>

                <textarea
                  className="form-control"
                  placeholder="Expense description"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                />

                <button className="primary-button" type="submit">
                  Add Expense
                </button>
              </form>
            )}

            {dataLoading && <p>Loading expenses...</p>}

            {!dataLoading && !dataError && expenses.length === 0 && (
              <p className="coming-soon">No expense records found.</p>
            )}

{expenses.map((expense) => (
  <div className="activity-row" key={expense._id}>
    <div className="activity-icon">↗</div>

    {/* Left side: expense information */}
    <div className="activity-details">
      <strong>{expense.title || expense.name}</strong>
      <p>{expense.description}</p>
    </div>

    {/* Right side: amount, date, and buttons */}
    <div className="expense-right">
      <div className="activity-amount">
        <strong>
          ₹{Number(expense.amount).toLocaleString("en-IN")}
        </strong>
        <p>
          {expense.date
            ? new Date(expense.date).toLocaleDateString("en-IN")
            : ""}
        </p>
      </div>

      {currentUser?.role === "admin" && (
        <div className="expense-actions">
          <button
            type="button"
            onClick={() => startEditExpense(expense)}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => handleDeleteExpense(expense._id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>

    {/* Edit form appears separately, like Funds */}
    {editingExpenseId === expense._id && (
      <form
        className="edit-record-form"
        onSubmit={handleUpdateExpense}
      >
        <input
          value={editExpenseTitle}
          onChange={(e) => setEditExpenseTitle(e.target.value)}
          placeholder="Expense title"
          required
        />

        <input
          type="number"
          min="1"
          value={editExpenseAmount}
          onChange={(e) => setEditExpenseAmount(e.target.value)}
          placeholder="Amount"
          required
        />

        <select
          value={editExpenseCategory}
          onChange={(e) => setEditExpenseCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Electricity">Electricity</option>
          <option value="Water">Water</option>
          <option value="Security">Security</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Repairs">Repairs</option>
          <option value="Events">Events</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          value={editExpenseDescription}
          onChange={(e) => setEditExpenseDescription(e.target.value)}
          placeholder="Description"
        />

        <button type="submit">Save Changes</button>

        <button
          type="button"
          onClick={() => setEditingExpenseId(null)}
        >
          Cancel
        </button>
      </form>
    )}
  </div>
))}
          </section>
        )}


        {activePage === 'Reports' && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Financial Reports</h2>
                <p>
                  Overview of your society's funds and expenses.
                </p>
              </div>
            </div>

            {/* Date Filters */}
            <div className="report-filters">
              <div className="report-filter-group">
                <label htmlFor="reportStartDate">Start Date</label>
                <input
                  id="reportStartDate"
                  type="date"
                  value={reportStartDate}
                  max={reportEndDate || undefined}
                  onChange={(e) =>
                    setReportStartDate(e.target.value)
                  }
                />
              </div>

              <div className="report-filter-group">
                <label htmlFor="reportEndDate">End Date</label>
                <input
                  id="reportEndDate"
                  type="date"
                  value={reportEndDate}
                  min={reportStartDate || undefined}
                  onChange={(e) =>
                    setReportEndDate(e.target.value)
                  }
                />
              </div>

              <button
                type="button"
                className="report-clear-btn"
                onClick={() => {
                  setReportStartDate('')
                  setReportEndDate('')
                }}
              >
                Clear Filters
              </button>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={() =>
                exportReportsCSV(filteredFunds, filteredExpenses)
              }
            >
              Export CSV
            </button>

            {/* Financial Summary */}
            <div className="report-summary">
              <div className="report-card">
                <p>Total Funds Collected</p>
                <h3>
                  ₹{reportTotalFunds.toLocaleString('en-IN')}
                </h3>
              </div>

              <div className="report-card">
                <p>Total Expenses</p>
                <h3>
                  ₹{reportTotalExpenses.toLocaleString('en-IN')}
                </h3>
              </div>

              <div className="report-card">
                <p>Available Balance</p>
                <h3>
                  ₹{reportAvailableBalance.toLocaleString('en-IN')}
                </h3>
              </div>
            </div>

            {/* Fund Collection History */}
            <div className="report-table-section">
              <h3>Fund Collection History</h3>

              {filteredFunds.length === 0 ? (
                <p>No fund records found for this date range.</p>
              ) : (
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Fund Name</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredFunds.map((fund) => (
                        <tr key={fund._id}>
                          <td>{fund.name}</td>
                          <td>{fund.type}</td>
                          <td>
                            ₹{Number(fund.amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            {fund.date
                              ? new Date(fund.date).toLocaleDateString('en-IN')
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expense History */}
            <div className="report-table-section">
              <h3>Expense History</h3>

              {filteredExpenses.length === 0 ? (
                <p>No expense records found for this date range.</p>
              ) : (
                <div className="table-responsive">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense._id}>
                          <td>{expense.title}</td>
                          <td>{expense.category}</td>
                          <td>
                            ₹{Number(expense.amount).toLocaleString('en-IN')}
                          </td>
                          <td>
                            {expense.date
                              ? new Date(expense.date).toLocaleDateString('en-IN')
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activePage === 'Society' && (
          <section className="content-card society-card">
            <div className="society-header">
              <div>
                <p className="society-eyebrow">COMMUNITY PROFILE</p>
                <h2>Society Information</h2>
                <p className="society-subtitle">
                  Details about your registered society
                </p>
              </div>

              <div className="society-icon">⌂</div>
            </div>

            {societyLoading ? (
              <p className="coming-soon">Loading society details...</p>
            ) : society ? (
              <>
                <div className="society-name-banner">
                  <span className="society-label">SOCIETY NAME</span>
                  <h3>{society.name}</h3>
                </div>

                <div className="society-details-grid">
                  <div className="society-detail">
                    <span className="society-detail-icon">⌖</span>
                    <div>
                      <p>Address</p>
                      <strong>{society.address}</strong>
                    </div>
                  </div>

                  <div className="society-detail">
                    <span className="society-detail-icon">♙</span>
                    <div>
                      <p>Total Members</p>
                      <strong>{society.totalMembers ?? 0}</strong>
                    </div>
                  </div>

                  <div className="society-detail">
                    <span className="society-detail-icon">▦</span>
                    <div>
                      <p>Financial Year</p>
                      <strong>{society.financialYear || 'Not set'}</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="coming-soon">
                No society information found for this account.
              </p>
            )}
          </section>
        )}

        {activePage === 'Manage Invitations' &&
          currentUser?.role === 'admin' && (
            <section className="content-card">
              <h2>Resident Invitations</h2>
              <p className="coming-soon">
                Generate a code to invite residents to your society.
              </p>

              <form
                className="expense-form"
                onSubmit={handleGenerateInvitation}
              >
                <div className="invitation-fields">
                  <div className="form-group">
                    <label>Expiry (days)</label>
                    <input
                      type="number"
                      value={invitationExpiry}
                      onChange={(e) => setInvitationExpiry(e.target.value)}
                      min="1"
                      required
                    />
                    <small>How many days the invitation code remains valid.</small>
                  </div>

                  <div className="form-group">
                    <label>Maximum Uses</label>
                    <input
                      type="number"
                      value={invitationMaxUses}
                      onChange={(e) => setInvitationMaxUses(e.target.value)}
                      min="1"
                      required
                    />
                    <small>How many residents can register using this code.</small>
                  </div>
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={invitationLoading}
                >
                  {invitationLoading ? 'Generating...' : 'Generate Code'}
                </button>
              </form>

              {invitationError && (
                <p className="login-error">{invitationError}</p>
              )}

              {invitationCode && (
                <div className="society-name-banner">
                  <span className="society-label">INVITATION CODE</span>
                  <h3>{invitationCode}</h3>

                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(invitationCode)
                    }}
                  >
                    Copy Code
                  </button>
                </div>
              )}
            </section>
          )}

        <footer>
          Society Fund Transparency Dashboard
          <span>Making community finances transparent.</span>
        </footer>
      </main>
    </div>
  )
}

export default App