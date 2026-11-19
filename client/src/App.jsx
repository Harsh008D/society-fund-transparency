import { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import Signup from "./Signup";
import SocietyRegister from "./SocietyRegister";
import AppLayout from "./components/layout/AppLayout.jsx";
import "./styles/dashboard.css";
import FinancialOverview from "./components/dashboard/FinancialOverview";
import RecentActivity from "./components/dashboard/RecentActivity";
import FinancialInsights from "./components/dashboard/FinancialInsights";
import BudgetPage from "./components/budget/BudgetPage";

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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(null);
  const [society, setSociety] = useState(null);
  const [societyLoading, setSocietyLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [showSocietyRegister, setShowSocietyRegister] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");
  const [funds, setFunds] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reviewingExpenseId, setReviewingExpenseId] = useState(null);
  const [approvalError, setApprovalError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [fundsLoading, setFundsLoading] = useState(true);
  const [fundsError, setFundsError] = useState("");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [invitationExpiry, setInvitationExpiry] = useState(7);
  const [invitationMaxUses, setInvitationMaxUses] = useState(5);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [committeeName, setCommitteeName] = useState("");
  const [committeeEmail, setCommitteeEmail] = useState("");
  const [committeePassword, setCommitteePassword] = useState("");
  const [committeeLoading, setCommitteeLoading] = useState(false);
  const [committeeError, setCommitteeError] = useState("");
  const [committeeMessage, setCommitteeMessage] = useState("");
  const [fundName, setFundName] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundType, setFundType] = useState("");
  const [fundDescription, setFundDescription] = useState("");
  const [fundDate, setFundDate] = useState("");
  const [fundSubmitError, setFundSubmitError] = useState("");
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editExpenseTitle, setEditExpenseTitle] = useState("");
  const [editExpenseAmount, setEditExpenseAmount] = useState("");
  const [editExpenseCategory, setEditExpenseCategory] = useState("");
  const [editExpenseDescription, setEditExpenseDescription] = useState("");
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [committeeListLoading, setCommitteeListLoading] = useState(false);
  const [editingFundId, setEditingFundId] = useState(null);
  const [editFundForm, setEditFundForm] = useState({
    name: "",
    amount: "",
    type: "",
    description: "",
    date: "",
  });

  // Your existing society ID
  const societyId = society?._id;

  // Fetch logged-in user's profile and society
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setCurrentUser(null);
        setSociety(null);
        setSocietyLoading(false);
        return;
      }

      setSocietyLoading(true);

      try {
        const response = await fetch("https://society-fund-transparency.onrender.com/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load profile");
        }

        setCurrentUser(data.user);
        setSociety(data.user.society);
      } catch (error) {
        setDataError(error.message);
      } finally {
        setSocietyLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleAddFund = async (e) => {
    e.preventDefault();
    setFundSubmitError("");
    setFundSubmitting(true);

    try {
      const response = await fetch("https://society-fund-transparency.onrender.com/api/funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        throw new Error(data.message || "Could not add fund");
      }

      setFunds((prev) => [data.fund, ...prev]);

      setFundName("");
      setFundAmount("");
      setFundType("");
      setFundDescription("");
      setFundDate("");
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
        `https://society-fund-transparency.onrender.com/api/funds/${editingFundId}`,
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
        prev.map((fund) => (fund._id === editingFundId ? data.fund : fund))
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
        `https://society-fund-transparency.onrender.com/api/funds/${fundId}`,
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
        setFunds([]);
        setExpenses([]);
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      setDataError("");

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [fundsResponse, expensesResponse] = await Promise.all([
          fetch(`https://society-fund-transparency.onrender.com/api/funds/${societyId}`, {
            headers,
          }),
          fetch("https://society-fund-transparency.onrender.com/api/expenses", {
            headers,
          }),
        ]);

        const fundsData = await fundsResponse.json();
        const expensesData = await expensesResponse.json();

        if (!fundsResponse.ok) {
          throw new Error(fundsData.message || "Could not load funds");
        }

        if (!expensesResponse.ok) {
          throw new Error(expensesData.message || "Could not load expenses");
        }

        setFunds(Array.isArray(fundsData) ? fundsData : fundsData.funds || []);
        setExpenses(
          Array.isArray(expensesData)
            ? expensesData
            : expensesData.expenses || []
        );
      } catch (error) {
        setDataError(error.message || "Failed to load financial data");
      } finally {
        setDataLoading(false);
      }
    };

    fetchFinancialData();
  }, [token, societyId]);

  useEffect(() => {
    if (
      activePage === "Manage Invitations" &&
      currentUser?.role === "admin" &&
      token
    ) {
      fetchCommitteeMembers();
    }
  }, [activePage, currentUser, token]);

  const totalFunds = funds.reduce(
    (total, fund) => total + Number(fund.amount || 0),
    0
  );

  const approvedExpenses = expenses.filter(
    (expense) => expense.status === "Approved"
  );

  const totalExpenses = approvedExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const availableBalance = totalFunds - totalExpenses;

  const getDateKey = (date) => {
    if (!date) return "";
    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const isWithinReportRange = (date) => {
    const dateKey = getDateKey(date);

    if (!dateKey) return false;
    if (reportStartDate && dateKey < reportStartDate) return false;
    if (reportEndDate && dateKey > reportEndDate) return false;

    return true;
  };

  const filteredFunds = funds.filter((fund) => isWithinReportRange(fund.date));

  const filteredExpenses = approvedExpenses.filter((expense) =>
    isWithinReportRange(expense.date)
  );

  const reportTotalFunds = filteredFunds.reduce(
    (total, fund) => total + Number(fund.amount || 0),
    0
  );

  const reportTotalExpenses = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  const reportAvailableBalance = reportTotalFunds - reportTotalExpenses;

  // Monthly financial trend
  const monthlyTrend = (() => {
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - i);

      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      const monthFunds = filteredFunds
        .filter((item) => {
          if (!item.date) return false;
          const d = new Date(item.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      const monthExpenses = filteredExpenses
        .filter((item) => {
          if (!item.date) return false;
          const d = new Date(item.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, item) => sum + Number(item.amount || 0), 0);

      months.push({
        key,
        label: date.toLocaleDateString("en-IN", { month: "short" }),
        funds: monthFunds,
        expenses: monthExpenses,
      });
    }

    return months;
  })();

  // Expense category breakdown
  const categoryBreakdown = Object.values(
    filteredExpenses.reduce((groups, expense) => {
      const category = expense.category || "Uncategorized";

      if (!groups[category]) {
        groups[category] = { name: category, amount: 0 };
      }

      groups[category].amount += Number(expense.amount || 0);
      return groups;
    }, {})
  )
    .map((item) => ({
      ...item,
      percentage: reportTotalExpenses
        ? (item.amount / reportTotalExpenses) * 100
        : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Preset date filters
  const applyReportPreset = (preset) => {
    const today = new Date();

    const toDateInput = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    let start;
    let end = new Date(today);

    if (preset === "thisMonth") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (preset === "lastMonth") {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === "last3Months") {
      start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    } else if (preset === "thisYear") {
      start = new Date(today.getFullYear(), 0, 1);
    }

    setReportStartDate(toDateInput(start));
    setReportEndDate(toDateInput(end));
  };

  const recentActivities = [
    ...funds.map((fund) => ({
      ...fund,
      activityType: "Fund",
      activityName: fund.name,
      activityAmount: Number(fund.amount || 0),
    })),
    ...approvedExpenses.map((expense) => ({
      ...expense,
      activityType: "Expense",
      activityName: expense.title,
      activityAmount: Number(expense.amount || 0),
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0)
    )
    .slice(0, 5);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    setSociety(null);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://society-fund-transparency.onrender.com/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: expenseTitle,
          amount: Number(expenseAmount),
          category: expenseCategory,
          description: expenseDescription,
          society: societyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add expense");
      }

      setExpenses((prev) => [data.expense, ...prev]);
      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseCategory("");
      setExpenseDescription("");
    } catch (error) {
      setDataError(error.message);
    }
  };

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense._id);
    setEditExpenseTitle(expense.title || expense.name || "");
    setEditExpenseAmount(expense.amount || "");
    setEditExpenseCategory(expense.category || "");
    setEditExpenseDescription(expense.description || "");
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://society-fund-transparency.onrender.com/api/expenses/${editingExpenseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
        throw new Error(data.message || "Could not update expense");
      }

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === editingExpenseId ? data.expense : expense
        )
      );

      setEditingExpenseId(null);
      setEditExpenseTitle("");
      setEditExpenseAmount("");
      setEditExpenseCategory("");
      setEditExpenseDescription("");
    } catch (error) {
      setDataError(error.message);
    }
  };

  const handleReviewExpense = async (expenseId, action) => {
    if (currentUser?.role !== "committee") return;

    let reason = "";

    if (action === "reject" || action === "request-changes") {
      const promptMessage =
        action === "reject"
          ? "Enter the reason for rejecting this expense:"
          : "Explain what changes the admin needs to make:";

      const input = window.prompt(promptMessage);

      if (input === null) return;

      reason = input.trim();

      if (!reason) {
        setApprovalError(
          action === "reject"
            ? "A rejection reason is required."
            : "Please explain the required changes."
        );
        return;
      }
    } else {
      const confirmed = window.confirm(
        "Are you sure you want to approve this expense?"
      );

      if (!confirmed) return;
    }

    setReviewingExpenseId(expenseId);
    setApprovalError("");
    setApprovalMessage("");

    try {
      const response = await fetch(
        `https://society-fund-transparency.onrender.com/api/expenses/${expenseId}/${action}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            action === "reject"
              ? { reason }
              : action === "request-changes"
              ? { comment: reason }
              : { comment: "Approved by committee member" }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not review expense");
      }

      setExpenses((prev) =>
        prev.map((expense) =>
          expense._id === expenseId ? data.expense : expense
        )
      );

      setApprovalMessage(
        action === "approve"
          ? "Expense approved successfully."
          : action === "reject"
          ? "Expense rejected successfully."
          : "Changes requested successfully."
      );
    } catch (error) {
      setApprovalError(error.message);
    } finally {
      setReviewingExpenseId(null);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://society-fund-transparency.onrender.com/api/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete expense");
      }

      setExpenses((prev) =>
        prev.filter((expense) => expense._id !== expenseId)
      );
    } catch (error) {
      setDataError(error.message);
    }
  };

  const handleGenerateInvitation = async (e) => {
    e.preventDefault();

    setInvitationLoading(true);
    setInvitationError("");
    setInvitationCode("");

    try {
      const response = await fetch("https://society-fund-transparency.onrender.com/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expiresInDays: Number(invitationExpiry),
          maxUses: Number(invitationMaxUses),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not generate code");
      }

      setInvitationCode(data.invitation.code);
    } catch (error) {
      setInvitationError(error.message);
    } finally {
      setInvitationLoading(false);
    }
  };

  const fetchCommitteeMembers = async () => {
    setCommitteeListLoading(true);

    try {
      const response = await fetch(
        "https://society-fund-transparency.onrender.com/api/societies/committee",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not fetch committee members");
      }

      setCommitteeMembers(data.members || []);
    } catch (error) {
      setCommitteeError(error.message);
    } finally {
      setCommitteeListLoading(false);
    }
  };

  const handleDeleteCommittee = async (memberId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this committee member?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://society-fund-transparency.onrender.com/api/societies/committee/${memberId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not remove committee member");
      }

      setCommitteeMembers((prev) =>
        prev.filter((member) => member._id !== memberId)
      );

      setCommitteeMessage("Committee member removed successfully!");
      setCommitteeError("");
    } catch (error) {
      setCommitteeError(error.message);
    }
  };

  const handleCreateCommittee = async (e) => {
    e.preventDefault();
    setCommitteeLoading(true);
    setCommitteeError("");
    setCommitteeMessage("");

    try {
      const response = await fetch(
        "https://society-fund-transparency.onrender.com/api/societies/committee",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: committeeName,
            email: committeeEmail,
            password: committeePassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create committee member");
      }

      setCommitteeMessage("Committee member created successfully!");
      setCommitteeName("");
      setCommitteeEmail("");
      setCommitteePassword("");

      await fetchCommitteeMembers();
    } catch (error) {
      setCommitteeError(error.message);
    } finally {
      setCommitteeLoading(false);
    }
  };

  if (!token) {
    if (showSocietyRegister) {
      return (
        <SocietyRegister
          onRegister={handleLogin}
          onBackToLogin={() => setShowSocietyRegister(false)}
        />
      );
    }

    if (showSignup) {
      return (
        <Signup
          onRegister={handleLogin}
          onBackToLogin={() => setShowSignup(false)}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSignupClick={() => setShowSignup(true)}
        onSocietyRegisterClick={() => setShowSocietyRegister(true)}
      />
    );
  }
  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Budgets", icon: "◫" },
    { name: "Funds", icon: "₹" },
    { name: "Expenses", icon: "↗" },
    { name: "Reports", icon: "📊" },
    { name: "Society", icon: "⌂" },

    ...(currentUser?.role === "admin"
      ? [{ name: "Manage Invitations", icon: "✉" }]
      : []),

    ...(currentUser?.role === "committee"
      ? [{ name: "Expense Approvals", icon: "✓" }]
      : []),
  ];

  return (
    <AppLayout
      activePage={activePage}
      setActivePage={setActivePage}
      currentUser={currentUser}
      handleLogout={handleLogout}
      menuItems={menuItems}
    >
      {activePage === "Dashboard" && (
        <>
          <section className="welcome">
            <div>
              <p className="eyebrow">
                {currentUser?.role === "admin"
                  ? "ADMIN OVERVIEW"
                  : "RESIDENT OVERVIEW"}
              </p>

              <h2>Welcome, {currentUser?.name || "User"} 👋</h2>

              <p>
                {currentUser?.role === "admin"
                  ? "Manage your society finances, track expenses, and keep residents informed."
                  : "View your society funds, track expenses, and stay informed about financial activity."}
              </p>
            </div>
            <div className="welcome-icon">₹</div>
          </section>

          {dataLoading && <p>Loading financial data...</p>}

          {dataError && <p className="login-error">{dataError}</p>}

          <section className="stats-grid">
            <div
              className="stat-card clickable-card"
              onClick={() => setActivePage("Funds")}
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
              onClick={() => setActivePage("Expenses")}
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
              onClick={() => setActivePage("Funds")}
            >
              <div className="stat-top">
                <span>Available Balance</span>
                <span className="stat-icon green">✓</span>
              </div>
              <h2>{formatCurrency(availableBalance)}</h2>
              <p>Funds minus expenses</p>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Total Transactions</span>
                <span className="stat-icon teal">↗</span>
              </div>
              <h2>{funds.length + expenses.length}</h2>
              <p>Recorded financial entries</p>
            </div>
          </section>

          <FinancialOverview
            funds={funds}
            expenses={expenses}
            formatCurrency={formatCurrency}
          />

          <FinancialInsights
            funds={funds}
            expenses={expenses}
            formatCurrency={formatCurrency}
          />

          {currentUser?.role === "admin" ? (
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
                  onClick={() => setActivePage("Expenses")}
                >
                  Add Expense
                </button>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Manage Invitations")}
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
                  onClick={() => setActivePage("Funds")}
                >
                  View Funds
                </button>

                <button
                  className="primary-button"
                  onClick={() => setActivePage("Expenses")}
                >
                  View Expenses
                </button>
              </div>
            </section>
          )}

          <RecentActivity
            activities={recentActivities}
            formatCurrency={formatCurrency}
            onViewFunds={() => setActivePage("Funds")}
            onViewExpenses={() => setActivePage("Expenses")}
          />
        </>
      )}

      {activePage === "Budgets" && (
        <BudgetPage token={token} currentUser={currentUser} />
      )}

      {activePage === "Funds" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Society Funds</h2>
              <p>View funds collected by your society.</p>
            </div>
          </div>

          {currentUser?.role === "admin" && (
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
                  <option value="events">Events</option>
                  <option value="donations">Donations</option>
                  <option value="special">Special</option>z
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
                  {fundSubmitting ? "Adding..." : "＋ Add Fund"}
                </button>
              </div>
            </form>
          )}

          {fundsError && <p>{fundsError}</p>}

          {funds.length === 0 && !fundsError && (
            <p className="coming-soon">No fund records found.</p>
          )}

          {funds.map((fund) => (
            <div className="fund-list-item" key={fund._id}>
              {/* Fund display row */}
              <div className="activity-row">
                <div className="activity-icon">₹</div>

                <div className="activity-details">
                  <strong>{fund.name}</strong>
                  <p>
                    {fund.type} · {fund.description}
                  </p>
                </div>

                <div className="activity-amount">
                  <strong>
                    ₹{Number(fund.amount).toLocaleString("en-IN")}
                  </strong>
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
              </div>

              {/* Separate edit form below the fund row */}
              {editingFundId === fund._id && (
                <form
                  className="edit-record-form fund-edit-form"
                  onSubmit={handleUpdateFund}
                >
                  <h3>Edit Fund</h3>

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
                    <option value="events">Events</option>
                    <option value="donations">Donations</option>
                    <option value="special">Special</option>
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

                  <div className="fund-edit-actions">
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={cancelEditFund}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </section>
      )}

      {activePage === "Expenses" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Society Expenses</h2>
              <p>View expenses recorded by your society.</p>
            </div>
          </div>

          {dataError && <p>{dataError}</p>}

          {currentUser?.role === "admin" && (
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

          <div className="recent-activity-list">
            {expenses.map((expense) => (
              <div className="recent-activity-item" key={expense._id}>
                <div className="activity-type-icon expense">↗</div>

                <div className="recent-activity-info">
                  <strong>{expense.title || expense.name}</strong>

                  <div className="recent-activity-meta">
                    <span className="activity-type-label expense">Expense</span>

                    {expense.category && <span>{expense.category}</span>}

                    <span>
                      {expense.date || expense.createdAt
                        ? new Date(
                            expense.date || expense.createdAt
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Date unavailable"}
                    </span>
                  </div>

                  {expense.description && (
                    <p className="recent-activity-description">
                      {expense.description}
                    </p>
                  )}

                  <p className="expense-status">
                    Status: <strong>{expense.status || "Pending"}</strong>
                  </p>

                  {expense.status === "Changes Requested" && (
                    <p className="expense-feedback">
                      Committee feedback:{" "}
                      {expense.approvalHistory
                        ?.filter((item) => item.action === "Changes Requested")
                        .slice(-1)
                        .map((item, index) => (
                          <span key={index}>{item.comment}</span>
                        ))}
                    </p>
                  )}

                  {expense.status === "Rejected" && expense.rejectionReason && (
                    <p className="expense-feedback">
                      Rejection reason: {expense.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="recent-activity-amount outgoing">
                  <strong>
                    −{formatCurrency(Number(expense.amount || 0))}
                  </strong>
                  <span>Money spent</span>
                </div>

                {currentUser?.role === "admin" &&
                  ["Pending", "Changes Requested"].includes(expense.status) && (
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
                      onChange={(e) =>
                        setEditExpenseDescription(e.target.value)
                      }
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
          </div>
        </section>
      )}

      {activePage === "Reports" && (
        <section className="content-card reports-page" id="reports-print-area">
          <div className="section-heading reports-heading">
            <div>
              <p className="reports-eyebrow">FINANCIAL MANAGEMENT</p>
              <h2>Financial Reports</h2>
              <p>
                Track collections, spending and your society's financial health.
              </p>
            </div>

            <div className="report-actions">
              <button
                type="button"
                className="report-export-btn"
                onClick={() =>
                  exportReportsCSV(filteredFunds, filteredExpenses)
                }
              >
                ↓ Export CSV
              </button>

              <button
                type="button"
                className="report-export-btn report-pdf-btn"
                onClick={() => window.print()}
              >
                ↓ Print / Save PDF
              </button>
            </div>
          </div>

          {/* Date filters */}
          <div className="report-filter-panel">
            <div className="report-presets">
              <button onClick={() => applyReportPreset("thisMonth")}>
                This month
              </button>
              <button onClick={() => applyReportPreset("lastMonth")}>
                Last month
              </button>
              <button onClick={() => applyReportPreset("last3Months")}>
                Last 3 months
              </button>
              <button onClick={() => applyReportPreset("thisYear")}>
                This year
              </button>
            </div>

            <div className="report-filters">
              <div className="report-filter-group">
                <label htmlFor="reportStartDate">Start date</label>
                <input
                  id="reportStartDate"
                  type="date"
                  value={reportStartDate}
                  max={reportEndDate || undefined}
                  onChange={(e) => setReportStartDate(e.target.value)}
                />
              </div>

              <div className="report-filter-group">
                <label htmlFor="reportEndDate">End date</label>
                <input
                  id="reportEndDate"
                  type="date"
                  value={reportEndDate}
                  min={reportStartDate || undefined}
                  onChange={(e) => setReportEndDate(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="report-clear-btn"
                onClick={() => {
                  setReportStartDate("");
                  setReportEndDate("");
                }}
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="report-summary">
            <div className="report-card report-funds-card">
              <span>Total funds collected</span>
              <h3>{formatCurrency(reportTotalFunds)}</h3>
              <small>Money received</small>
            </div>

            <div className="report-card report-expenses-card">
              <span>Total expenses</span>
              <h3>{formatCurrency(reportTotalExpenses)}</h3>
              <small>Money spent</small>
            </div>

            <div className="report-card report-balance-card">
              <span>Available balance</span>
              <h3>{formatCurrency(reportAvailableBalance)}</h3>
              <small>Funds minus expenses</small>
            </div>
          </div>

          {/* Monthly trends */}
          <div className="report-insights-grid">
            <div className="report-insight-card">
              <div className="report-section-title">
                <div>
                  <h3>Monthly financial trends</h3>
                  <p>Funds collected vs expenses</p>
                </div>
                <span>Last 6 months</span>
              </div>

              <div className="monthly-trend-list">
                {monthlyTrend.map((month) => {
                  const maxValue = Math.max(
                    ...monthlyTrend.flatMap((item) => [
                      item.funds,
                      item.expenses,
                    ]),
                    1
                  );

                  return (
                    <div className="monthly-trend-item" key={month.key}>
                      <div className="monthly-trend-label">{month.label}</div>

                      <div className="monthly-trend-bars">
                        <div className="trend-bar-track">
                          <div
                            className="trend-bar funds-bar"
                            style={{
                              width: `${(month.funds / maxValue) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="trend-bar-track">
                          <div
                            className="trend-bar expenses-bar"
                            style={{
                              width: `${(month.expenses / maxValue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="monthly-trend-values">
                        <span>{formatCurrency(month.funds)}</span>
                        <span>{formatCurrency(month.expenses)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="report-chart-legend">
                <span>
                  <i className="legend-funds" /> Funds
                </span>
                <span>
                  <i className="legend-expenses" /> Expenses
                </span>
              </div>
            </div>

            {/* Expense breakdown */}
            <div className="report-insight-card">
              <div className="report-section-title">
                <div>
                  <h3>Expense breakdown</h3>
                  <p>Spending by category</p>
                </div>
              </div>

              {categoryBreakdown.length === 0 ? (
                <p className="report-empty">
                  No expense data available for this period.
                </p>
              ) : (
                <div className="category-breakdown">
                  {categoryBreakdown.map((item, index) => (
                    <div className="category-item" key={item.name}>
                      <div className="category-item-heading">
                        <strong>{item.name}</strong>
                        <span>{item.percentage.toFixed(1)}%</span>
                      </div>

                      <div className="category-progress">
                        <div
                          className={`category-progress-fill category-color-${
                            index % 4
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>

                      <small>{formatCurrency(item.amount)}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fund history */}
          <div className="report-table-section">
            <div className="report-section-title">
              <div>
                <h3>Fund collection history</h3>
                <p>{filteredFunds.length} records found</p>
              </div>
            </div>

            {filteredFunds.length === 0 ? (
              <p className="report-empty">
                No fund records found for this date range.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Fund name</th>
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
                        <td>{formatCurrency(Number(fund.amount || 0))}</td>
                        <td>
                          {fund.date
                            ? new Date(fund.date).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expense history */}
          <div className="report-table-section">
            <div className="report-section-title">
              <div>
                <h3>Expense history</h3>
                <p>{filteredExpenses.length} records found</p>
              </div>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="report-empty">
                No expense records found for this date range.
              </p>
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
                        <td>{expense.title || expense.name}</td>
                        <td>{expense.category || "Other"}</td>
                        <td>{formatCurrency(Number(expense.amount || 0))}</td>
                        <td>
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString("en-IN")
                            : "—"}
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

      {activePage === "Expense Approvals" &&
        currentUser?.role === "committee" && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Expense Approvals</h2>
                <p>Review expenses submitted by your society admin.</p>
              </div>
            </div>

            {approvalError && <p className="login-error">{approvalError}</p>}

            {approvalMessage && <p role="status">{approvalMessage}</p>}

            {dataLoading && <p>Loading expenses...</p>}

            {!dataLoading &&
              expenses.filter((expense) => expense.status === "Pending")
                .length === 0 && (
                <p className="coming-soon">
                  No pending expenses. Everything is reviewed!
                </p>
              )}

            {expenses
              .filter((expense) => expense.status === "Pending")
              .map((expense) => (
                <div className="activity-row" key={expense._id}>
                  <div className="activity-icon">₹</div>

                  <div className="activity-details">
                    <strong>{expense.title}</strong>
                    <p>Category: {expense.category}</p>
                    <p>
                      Description:{" "}
                      {expense.description || "No description provided"}
                    </p>
                    <p>Submitted by: {expense.recordedBy?.name || "Admin"}</p>
                  </div>

                  <div className="expense-right">
                    <div className="activity-amount">
                      <strong>{formatCurrency(expense.amount)}</strong>
                      <p>
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString("en-IN")
                          : ""}
                      </p>
                      <span>Pending</span>
                    </div>

                    <div className="expense-actions">
                      <button
                        type="button"
                        disabled={reviewingExpenseId === expense._id}
                        onClick={() =>
                          handleReviewExpense(expense._id, "approve")
                        }
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={reviewingExpenseId === expense._id}
                        onClick={() =>
                          handleReviewExpense(expense._id, "reject")
                        }
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={reviewingExpenseId === expense._id}
                        onClick={() =>
                          handleReviewExpense(expense._id, "request-changes")
                        }
                      >
                        Request Changes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </section>
        )}

      {activePage === "Society" && (
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
                    <strong>{society.financialYear || "Not set"}</strong>
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

      {activePage === "Manage Invitations" && currentUser?.role === "admin" && (
        <section className="content-card">
          <h2>Resident Invitations</h2>
          <p className="coming-soon">
            Generate a code to invite residents to your society.
          </p>

          <form className="expense-form" onSubmit={handleGenerateInvitation}>
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
              {invitationLoading ? "Generating..." : "Generate Code"}
            </button>
          </form>

          {invitationError && <p className="login-error">{invitationError}</p>}

          {invitationCode && (
            <div className="society-name-banner">
              <span className="society-label">INVITATION CODE</span>
              <h3>{invitationCode}</h3>

              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(invitationCode);
                }}
              >
                Copy Code
              </button>
            </div>
          )}

          <div className="committee-management-section">
            <h2>Committee Management</h2>
            <p>Add and manage your society committee members.</p>

            <form className="expense-form" onSubmit={handleCreateCommittee}>
              <input
                type="text"
                placeholder="Full name"
                value={committeeName}
                onChange={(e) => setCommitteeName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email address"
                value={committeeEmail}
                onChange={(e) => setCommitteeEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password (minimum 8 characters)"
                value={committeePassword}
                onChange={(e) => setCommitteePassword(e.target.value)}
                minLength={8}
                required
              />

              <button
                className="primary-button"
                type="submit"
                disabled={committeeLoading}
              >
                {committeeLoading ? "Please wait..." : "+ Add Committee Member"}
              </button>
            </form>

            {committeeError && <p className="login-error">{committeeError}</p>}

            {committeeMessage && (
              <p className="success-message">{committeeMessage}</p>
            )}

            <div className="committee-list">
              <h3>Existing Committee Members</h3>

              {committeeLoading && <p>Loading members...</p>}

              {!committeeLoading && committeeMembers.length === 0 && (
                <p className="coming-soon">No committee members found.</p>
              )}

              {committeeMembers.map((member) => (
                <div className="recent-activity-item" key={member._id}>
                  <div className="recent-activity-info">
                    <strong>{member.name}</strong>
                    <div className="recent-activity-meta">
                      <span>{member.email}</span>
                      <span>Committee Member</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => handleDeleteCommittee(member._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer>
        Society Fund Transparency Dashboard
        <span>Making community finances transparent.</span>
      </footer>
    </AppLayout>
  );
}

export default App;
