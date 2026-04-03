import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Table as TableIcon, TrendingUp, Plus, Search, 
  Trash2, Moon, Sun, BarChart3, PieChart as PieIcon, ArrowUpDown, 
  AlertCircle, X, Download, Calendar, Layers, List, CheckCircle2, Ghost, Menu, Edit3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- INITIAL MOCK DATA ---
const INITIAL_DATA = [
  { id: 1, date: '2026-03-01', amount: 5000, category: 'Salary', type: 'income', merchant: 'Zorvyn Corp' },
  { id: 2, date: '2026-03-05', amount: 120, category: 'Food', type: 'expense', merchant: 'Starbucks' },
  { id: 3, date: '2026-03-10', amount: 800, category: 'Rent', type: 'expense', merchant: 'Skyline Apts' },
  { id: 4, date: '2026-03-15', amount: 150, category: 'Shopping', type: 'expense', merchant: 'Amazon' },
  { id: 5, date: '2026-03-18', amount: 200, category: 'Utilities', type: 'expense', merchant: 'Electric Co' },
  { id: 6, date: '2026-03-22', amount: 50, category: 'Food', type: 'expense', merchant: 'Uber Eats' },
];

const CHART_DATA = [
  { name: 'Week 1', balance: 5000 },
  { name: 'Week 2', balance: 4880 },
  { name: 'Week 3', balance: 4080 },
  { name: 'Week 4', balance: 3680 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function App() {
  const [role, setRole] = useState('admin'); 
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('zorvyn_transactions');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortConfig, setSortConfig] = useState('date');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // New state for delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  const [viewMode, setViewMode] = useState('list'); 
  const tableRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('zorvyn_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message) => setToast(message);
  const scrollToTransactions = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    
    const categories = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const highestCat = Object.keys(categories).length > 0 
      ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b) 
      : 'N/A';
    
    const baseline = income * 0.3 || 1000;
    const diff = ((expenses - baseline) / baseline) * 100;

    return { income, expenses, balance: income - expenses, highestCat, diff };
  }, [transactions]);

  const pieData = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, []);
  }, [transactions]);

  const processedTransactions = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchesSearch = t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });

    if (viewMode === 'grouped') {
        const groups = filtered.reduce((acc, t) => {
            acc[t.category] = acc[t.category] || { category: t.category, amount: 0, count: 0, type: t.type };
            acc[t.category].amount += t.amount;
            acc[t.category].count += 1;
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => b.amount - a.amount);
    }

    return filtered.sort((a, b) => sortConfig === 'amount' ? b.amount - a.amount : new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, filterType, sortConfig, viewMode]);

  const exportData = (format) => {
    const dataStr = format === 'json' 
        ? JSON.stringify(transactions, null, 2)
        : "Date,Merchant,Category,Type,Amount\n" + transactions.map(t => `${t.date},${t.merchant},${t.category},${t.type},${t.amount}`).join("\n");
    
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zorvyn_export_${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
    showToast(`Successfully exported as ${format.toUpperCase()}`);
  };

  const handleAddTransaction = (newTx) => {
    if (editingTransaction) {
        setTransactions(transactions.map(t => t.id === editingTransaction.id ? newTx : t));
        showToast("Transaction updated!");
    } else {
        setTransactions([newTx, ...transactions]);
        showToast("Transaction added successfully!");
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const confirmDelete = () => {
    setTransactions(transactions.filter(x => x.id !== deleteId));
    setDeleteId(null);
    showToast("Transaction deleted");
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <TrendingUp size={20} className="text-white" />
        </div>
        <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zorvyn Pay</h1>
      </div>
      
      <nav className="space-y-2 flex-1">
        <button className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium text-left ${isDarkMode ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          <LayoutDashboard size={20} /> Dashboard
        </button>
        <button onClick={scrollToTransactions} className="flex items-center gap-3 w-full p-3 hover:bg-blue-600/5 rounded-xl transition text-slate-500 text-left">
          <TableIcon size={20} /> Transactions
        </button>
        <div className="pt-4 border-t border-inherit mt-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2">Export Data</p>
          <button onClick={() => exportData('csv')} className="flex items-center gap-3 w-full p-2 text-sm hover:bg-blue-600/5 rounded-lg transition text-slate-500"><Download size={14}/> CSV Format</button>
          <button onClick={() => exportData('json')} className="flex items-center gap-3 w-full p-2 text-sm hover:bg-blue-600/5 rounded-lg transition text-slate-500"><Download size={14}/> JSON Format</button>
        </div>
      </nav>

      <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-100 border-slate-200'}`}>
        <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">System Role</label>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          className={`w-full bg-transparent text-sm font-semibold outline-none cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
        >
          <option value="admin" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Admin</option>
          <option value="viewer" className={isDarkMode ? 'bg-slate-900' : 'bg-white'}>Viewer Mode</option>
        </select>
      </div>
    </>
  );

  return (
    <div className={`flex h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex w-64 border-r p-6 flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className={`fixed top-0 left-0 bottom-0 w-72 z-[70] p-6 flex flex-col md:hidden ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <header className="flex justify-between items-center mb-10">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 md:block">
                <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-slate-500/10">
                    <Menu size={24} />
                </button>
                <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Financial Health</h2>
            </div>
            <p className="hidden md:block text-slate-500 text-sm mt-1">Reviewing performance for March 2026</p>
          </motion.div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-full border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-yellow-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {role === 'admin' && (
              <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 transition">
                <Plus size={18} /> <span className="hidden sm:inline">New Entry</span>
              </button>
            )}
          </div>
        </header>

        {/* SUMMARY CARDS - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
          <Card title="Net Balance" value={`$${totals.balance.toLocaleString()}`} isDark={isDarkMode} />
          <Card title="Total Income" value={`$${totals.income.toLocaleString()}`} color="text-emerald-500" isDark={isDarkMode} />
          <Card title="Total Expenses" value={`$${totals.expenses.toLocaleString()}`} color="text-rose-500" isDark={isDarkMode} />
        </div>

        {/* DATA OBSERVATIONS & CHARTS - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className={`p-6 rounded-3xl border flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div>
                    <div className="flex items-center gap-2 text-blue-500 mb-4">
                        <AlertCircle size={18} />
                        <span className="text-xs font-bold uppercase">Smart Observation</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-500">
                        Your spending in <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{totals.highestCat}</span> accounts for the majority of your outgoings. 
                        Compared to average, your expenses are <span className={totals.diff > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                        {Math.abs(totals.diff).toFixed(1)}% {totals.diff > 0 ? 'higher' : 'lower'}</span>.
                    </p>
                </div>
                <div className="mt-6 pt-6 border-t border-inherit">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Highest Expense Category</span>
                    <span className={`text-xl font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totals.highestCat}</span>
                </div>
            </div>

            <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                    <BarChart3 size={16} /> Balance Trend
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA}>
                            <defs>
                                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="name" hide />
                            <YAxis hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#fff', color: isDarkMode ? '#fff' : '#0f172a' }} />
                            <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={`p-6 rounded-3xl border md:col-span-2 lg:col-span-1 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-6 flex items-center gap-2">
                    <PieIcon size={16} /> Allocation
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={pieData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                            </Pie>
                            <Tooltip />
                            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* TRANSACTIONS SECTION */}
        <section ref={tableRef} className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'}`}>
          <div className="p-6 border-b border-inherit flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Transaction Ledger</h3>
                    <div className={`flex border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <button onClick={() => setViewMode('list')} className={`p-2 transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><List size={16}/></button>
                        <button onClick={() => setViewMode('grouped')} className={`p-2 transition ${viewMode === 'grouped' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><Layers size={16}/></button>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input 
                        type="text" placeholder="Search..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none border transition-all ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-400'}`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-inherit">
                <div className="flex flex-wrap items-center gap-2">
                    <select 
                        onChange={(e) => setFilterType(e.target.value)}
                        className={`px-3 py-2 text-sm rounded-xl border outline-none cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                        <option value="all">All Types</option>
                        <option value="income">Credits</option>
                        <option value="expense">Debits</option>
                    </select>
                    
                    <button onClick={() => setSortConfig('date')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${sortConfig === 'date' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-inherit text-slate-500'}`}>
                        DATE <ArrowUpDown size={12} />
                    </button>
                    <button onClick={() => setSortConfig('amount')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${sortConfig === 'amount' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-inherit text-slate-500'}`}>
                        AMOUNT <ArrowUpDown size={12} />
                    </button>
                </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
                <thead className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-slate-500 bg-slate-800/20' : 'text-slate-400 bg-slate-50'}`}>
                <tr>
                    <th className="px-6 py-4">{viewMode === 'grouped' ? 'Category' : 'Posting Date'}</th>
                    <th className="px-6 py-4">{viewMode === 'grouped' ? 'Volume' : 'Merchant'}</th>
                    <th className="px-6 py-4">{viewMode === 'grouped' ? 'Primary Type' : 'Category'}</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    {role === 'admin' && viewMode === 'list' && <th className="px-6 py-4 text-center">Actions</th>}
                </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {processedTransactions.length > 0 ? processedTransactions.map((t, idx) => (
                    <tr key={t.id || idx} className={`transition-colors ${isDarkMode ? 'hover:bg-blue-600/[0.03]' : 'hover:bg-blue-600/[0.02]'}`}>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{viewMode === 'grouped' ? t.category : t.date}</td>
                    <td className={`px-6 py-4 font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {viewMode === 'grouped' ? `${t.count} Transactions` : t.merchant}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                        {t.category}
                        </span>
                    </td>
                    <td className={`px-6 py-4 font-medium text-right ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                    </td>
                    {role === 'admin' && viewMode === 'list' && (
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleEdit(t)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteId(t.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    )}
                    </tr>
                )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20">
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                          <div className={`p-4 rounded-full ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <Ghost size={40} className="text-slate-500 opacity-50" />
                          </div>
                          <div>
                            <h4 className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>No results found</h4>
                            <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                )}
                </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-2xl"
          >
            <CheckCircle2 size={18} className="text-emerald-500" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteId && (
          <DeleteConfirmModal 
            onClose={() => setDeleteId(null)} 
            onConfirm={confirmDelete}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} 
            onSubmit={handleAddTransaction} 
            isDarkMode={isDarkMode} 
            editData={editingTransaction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Card({ title, value, color = "", isDark }) {
  const defaultTextColor = isDark ? 'text-white' : 'text-slate-900';
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 md:p-8 rounded-[32px] border transition-all ${isDark ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}
    >
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-4">{title}</span>
      <div className={`text-2xl md:text-3xl font-medium tracking-tight ${color || defaultTextColor}`}>{value}</div>
    </motion.div>
  );
}

function DeleteConfirmModal({ onClose, onConfirm, isDarkMode }) {
    return (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className={`w-full max-w-sm p-8 rounded-[32px] border shadow-2xl text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">Delete Transaction?</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                This action is permanent and cannot be undone. Are you sure you want to remove this record?
            </p>
            <div className="flex flex-col gap-3">
                <button 
                    onClick={onConfirm}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-rose-500/20"
                >
                    Yes, Delete Entry
                </button>
                <button 
                    onClick={onClose}
                    className={`w-full font-bold py-3.5 rounded-2xl transition ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                    Keep Transaction
                </button>
            </div>
          </motion.div>
        </motion.div>
    );
}

function TransactionModal({ onClose, onSubmit, isDarkMode, editData }) {
  const [formData, setFormData] = useState({ 
    merchant: editData?.merchant || '', 
    amount: editData?.amount || '', 
    type: editData?.type || 'expense', 
    category: editData?.category || 'Food' 
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    
    if (!formData.merchant.trim()) return setError("Merchant name is required");
    if (isNaN(amountNum) || amountNum <= 0) return setError("Enter a valid positive amount");

    onSubmit({
      id: editData?.id || Date.now(),
      date: editData?.date || new Date().toISOString().split('T')[0],
      amount: amountNum,
      merchant: formData.merchant,
      type: formData.type,
      category: formData.type === 'income' ? 'Salary' : formData.category
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-md p-6 md:p-8 rounded-[32px] border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{editData ? 'Edit Transaction' : 'New Transaction'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-500/10 rounded-full"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Merchant</label>
            <input 
              autoFocus
              value={formData.merchant}
              className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              onChange={e => setFormData({...formData, merchant: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Amount ($)</label>
              <input 
                type="number"
                value={formData.amount}
                className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Type</label>
              <select 
                value={formData.type}
                className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="expense">Debit</option>
                <option value="income">Credit</option>
              </select>
            </div>
          </div>
          {formData.type === 'expense' && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Category</label>
              <select 
                value={formData.category}
                className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="Food">Food</option>
                <option value="Rent">Rent</option>
                <option value="Shopping">Shopping</option>
                <option value="Utilities">Utilities</option>
              </select>
            </div>
          )}
          
          {error && <p className="text-rose-500 text-xs font-medium italic">{error}</p>}

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition shadow-lg shadow-blue-600/20 mt-4">
            {editData ? 'Save Changes' : 'Add Transaction'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}