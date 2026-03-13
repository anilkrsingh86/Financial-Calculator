import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  ArrowRightLeft, 
  Info,
  DollarSign,
  Percent,
  Calendar,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

type CalculatorType = 'compound' | 'loan' | 'roi' | 'inflation';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden", className)}>
    {children}
  </div>
);

const InputGroup = ({ label, icon: Icon, value, onChange, type = "number", suffix }: any) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={16} />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-slate-900 font-medium"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

const ResultItem = ({ label, value, subValue, highlight = false }: any) => (
  <div className={cn("p-4 rounded-xl", highlight ? "bg-indigo-50 border border-indigo-100" : "bg-slate-50 border border-slate-100")}>
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={cn("text-2xl font-bold", highlight ? "text-indigo-600" : "text-slate-900")}>{value}</p>
    {subValue && <p className="text-sm text-slate-500 mt-1">{subValue}</p>}
  </div>
);

// --- Calculators ---

const CompoundInterestCalc = () => {
  const [principal, setPrincipal] = useState(10000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const data = useMemo(() => {
    const results = [];
    let total = principal;
    const monthlyRate = rate / 100 / 12;
    
    for (let i = 0; i <= years; i++) {
      results.push({
        year: i,
        balance: Math.round(total),
        contributions: principal + (monthly * 12 * i)
      });
      
      // Calculate next year
      for (let m = 0; m < 12; m++) {
        total = (total + monthly) * (1 + monthlyRate);
      }
    }
    return results;
  }, [principal, monthly, rate, years]);

  const finalBalance = data[data.length - 1].balance;
  const totalContributions = principal + (monthly * 12 * years);
  const totalInterest = finalBalance - totalContributions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <InputGroup label="Initial Investment" icon={DollarSign} value={principal} onChange={setPrincipal} suffix="USD" />
        <InputGroup label="Monthly Contribution" icon={RefreshCw} value={monthly} onChange={setMonthly} suffix="USD" />
        <InputGroup label="Annual Interest Rate" icon={Percent} value={rate} onChange={setRate} suffix="%" />
        <InputGroup label="Time Period" icon={Calendar} value={years} onChange={setYears} suffix="YRS" />
      </div>
      
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultItem label="Total Balance" value={`$${finalBalance.toLocaleString()}`} highlight />
          <ResultItem label="Total Contributions" value={`$${totalContributions.toLocaleString()}`} />
          <ResultItem label="Total Interest" value={`$${totalInterest.toLocaleString()}`} subValue={`${((totalInterest/finalBalance)*100).toFixed(1)}% of total`} />
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Area type="monotone" dataKey="balance" name="Total Balance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              <Area type="monotone" dataKey="contributions" name="Contributions" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const LoanCalc = () => {
  const [loanType, setLoanType] = useState<'mortgage' | 'auto' | 'personal'>('mortgage');
  const [amount, setAmount] = useState(250000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);

  const handleTypeChange = (type: 'mortgage' | 'auto' | 'personal') => {
    setLoanType(type);
    if (type === 'mortgage') {
      setAmount(250000);
      setRate(4.5);
      setYears(30);
    } else if (type === 'auto') {
      setAmount(35000);
      setRate(6.5);
      setYears(5);
    } else if (type === 'personal') {
      setAmount(15000);
      setRate(10.5);
      setYears(3);
    }
  };

  const stats = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    
    // Handle 0% interest case
    let monthlyPayment = 0;
    if (rate === 0) {
      monthlyPayment = amount / numPayments;
    } else {
      monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - amount;

    const schedule = [];
    let balance = amount;
    // For charts, if years > 10, show yearly, else show monthly? 
    // Actually, let's stick to yearly for consistency in UI, but maybe adjust for very short loans.
    const displayYears = Math.max(1, Math.ceil(years));
    
    for (let i = 1; i <= displayYears; i++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break;
        const interest = balance * monthlyRate;
        const principal = Math.min(balance, monthlyPayment - interest);
        yearlyInterest += interest;
        yearlyPrincipal += principal;
        balance -= principal;
      }
      schedule.push({
        year: i,
        interest: Math.round(yearlyInterest),
        principal: Math.round(yearlyPrincipal),
        balance: Math.max(0, Math.round(balance))
      });
    }

    return { monthlyPayment, totalPayment, totalInterest, schedule };
  }, [amount, rate, years]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'mortgage', label: 'Mortgage', icon: CreditCard },
          { id: 'auto', label: 'Auto Loan', icon: TrendingUp },
          { id: 'personal', label: 'Personal Loan', icon: ArrowRightLeft },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeChange(type.id as any)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              loanType === type.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <type.icon size={14} />
            {type.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <InputGroup label="Loan Amount" icon={DollarSign} value={amount} onChange={setAmount} suffix="USD" />
          <InputGroup label="Interest Rate" icon={Percent} value={rate} onChange={setRate} suffix="%" />
          <InputGroup label="Loan Term" icon={Calendar} value={years} onChange={setYears} suffix="YRS" />
        </div>
        
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultItem label="Monthly Payment" value={`$${stats.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} highlight />
            <ResultItem label="Total Interest" value={`$${stats.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <ResultItem label="Total Cost" value={`$${stats.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue={`${((stats.totalInterest/stats.totalPayment)*100).toFixed(1)}% interest`} />
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.schedule}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="principal" name="Principal" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                <Bar dataKey="interest" name="Interest" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ROICalc = () => {
  const [initial, setInitial] = useState(5000);
  const [final, setFinal] = useState(7500);
  const [years, setYears] = useState(3);

  const roi = ((final - initial) / initial) * 100;
  const annualized = (Math.pow(final / initial, 1 / years) - 1) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <InputGroup label="Initial Investment" icon={DollarSign} value={initial} onChange={setInitial} suffix="USD" />
        <InputGroup label="Final Value" icon={TrendingUp} value={final} onChange={setFinal} suffix="USD" />
        <InputGroup label="Time Period" icon={Calendar} value={years} onChange={setYears} suffix="YRS" />
      </div>
      
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultItem label="Total ROI" value={`${roi.toFixed(2)}%`} highlight />
          <ResultItem label="Annualized ROI" value={`${annualized.toFixed(2)}%`} />
          <ResultItem label="Total Profit" value={`$${(final - initial).toLocaleString()}`} />
        </div>
        
        <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Investment Performance</h3>
          <p className="text-slate-600 max-w-md">
            Your investment grew by <span className="font-bold text-indigo-600">{roi.toFixed(1)}%</span> over {years} years. 
            This is equivalent to a compounded annual growth rate (CAGR) of <span className="font-bold text-indigo-600">{annualized.toFixed(1)}%</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

const InflationCalc = () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(3);
  const [years, setYears] = useState(10);

  const futureValue = amount * Math.pow(1 + rate / 100, years);
  const purchasingPower = amount / Math.pow(1 + rate / 100, years);

  const data = useMemo(() => {
    const results = [];
    for (let i = 0; i <= years; i++) {
      results.push({
        year: i,
        value: Math.round(amount / Math.pow(1 + rate / 100, i))
      });
    }
    return results;
  }, [amount, rate, years]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <InputGroup label="Current Amount" icon={DollarSign} value={amount} onChange={setAmount} suffix="USD" />
        <InputGroup label="Inflation Rate" icon={TrendingDown} value={rate} onChange={setRate} suffix="%" />
        <InputGroup label="Years" icon={Calendar} value={years} onChange={setYears} suffix="YRS" />
      </div>
      
      <div className="lg:col-span-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultItem label="Future Cost" value={`$${futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue="What $1,000 today will cost in the future" highlight />
          <ResultItem label="Future Purchasing Power" value={`$${purchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subValue="What $1,000 in the future is worth today" />
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Purchasing Power']}
              />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<CalculatorType>('compound');

  const tabs = [
    { id: 'compound', label: 'Compound Interest', icon: TrendingUp },
    { id: 'loan', label: 'Loan / Mortgage', icon: CreditCard },
    { id: 'roi', label: 'Investment ROI', icon: PieChart },
    { id: 'inflation', label: 'Inflation', icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">FinCalc Pro</h1>
              <p className="text-xs text-slate-500 font-medium">Financial Intelligence Toolkit</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as CalculatorType)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalculatorType)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-2 border transition-all",
                activeTab === tab.id 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                  : "bg-white text-slate-600 border-slate-200"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <p className="text-slate-500">
            {activeTab === 'compound' && "See how your wealth grows over time with regular contributions and compounding interest."}
            {activeTab === 'loan' && "Calculate monthly payments, total interest, and see your amortization schedule."}
            {activeTab === 'roi' && "Measure the efficiency of an investment or compare the efficiency of several different investments."}
            {activeTab === 'inflation' && "Understand how inflation erodes your purchasing power over time."}
          </p>
        </div>

        <Card className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'compound' && <CompoundInterestCalc />}
              {activeTab === 'loan' && <LoanCalc />}
              {activeTab === 'roi' && <ROICalc />}
              {activeTab === 'inflation' && <InflationCalc />}
            </motion.div>
          </AnimatePresence>
        </Card>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Info size={20} />
            </div>
            <h4 className="font-bold mb-2">Why Compounding?</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Compounding is the process where the value of an investment increases because the earnings on an investment, both capital gains and interest, earn interest as time passes.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
              <CreditCard size={20} />
            </div>
            <h4 className="font-bold mb-2">Loan Strategy</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Paying even a small amount extra toward your principal each month can significantly reduce the total interest paid and shorten your loan term.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingDown size={20} />
            </div>
            <h4 className="font-bold mb-2">Inflation Impact</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Inflation is the rate at which the general level of prices for goods and services is rising. As inflation rises, every dollar you own buys a smaller percentage of a good or service.
            </p>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12 text-center">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} FinCalc Pro. For educational purposes only. Always consult with a financial advisor.
        </p>
      </footer>
    </div>
  );
}
