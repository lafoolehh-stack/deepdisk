import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    LayoutDashboard, 
    Search, 
    Filter, 
    PlusCircle, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ChevronRight, 
    ArrowUpRight, 
    TrendingUp, 
    FileBarChart, 
    Download, 
    LogOut, 
    Menu, 
    X, 
    MoreHorizontal, 
    Star, 
    ShieldCheck, 
    BookOpen, 
    ClipboardList, 
    Users, 
    Calendar, 
    ChevronLeft, 
    Trash2, 
    Printer, 
    Activity, 
    Terminal, 
    PieChart,
    Settings2,
    Check,
    Globe,
    FileText,
    BarChart3,
    History,
    Sun,
    Timer,
    UserCircle2,
    ChevronDown,
    Share2,
    FileSignature,
    UserCheck,
    MapPin,
    Briefcase,
    MessageCircle,
    XCircle,
    ClipboardCheck,
    Send,
    Eye,
    Phone,
    MessageSquare,
    UserPlus,
    Link2,
    Brain,
    Banknote,
    TrendingDown,
    Plus,
    Wallet,
    Lightbulb,
    ArrowDownRight,
    Calculator
} from 'lucide-react';
import { RecordStatus, RecordCategory, SomalipinRecord, ProgressStats, JournalEntry, SystemLog, MyDayTask, Appointment, NetworkingContact, FinanceEntry, BrainDumpEntry } from './types.ts';
import StatCard from './components/StatCard.tsx';
import Charts from './components/Charts.tsx';

const TARGET_GOAL = 401;

type AppView = 'journal-new' | 'journal-list' | 'journal-summary' | 'myday';
type MyDayTab = 'tasks' | 'appointments' | 'networking' | 'braindump' | 'finance';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('myday');
    const [myDayTab, setMyDayTab] = useState<MyDayTab>('tasks');
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [myDayTasks, setMyDayTasks] = useState<MyDayTask[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [networkingContacts, setNetworkingContacts] = useState<NetworkingContact[]>([]);
    const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
    const [brainDumpEntries, setBrainDumpEntries] = useState<BrainDumpEntry[]>([]);
    const [currentBrainThought, setCurrentBrainThought] = useState('');
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [showNetworkingForm, setShowNetworkingForm] = useState(false);
    const [showFinanceForm, setShowFinanceForm] = useState(false);
    const [selectedContactForMsg, setSelectedContactForMsg] = useState<NetworkingContact | null>(null);
    const [networkingMsgDraft, setNetworkingMsgDraft] = useState('');
    const [taskForLetter, setTaskForLetter] = useState<MyDayTask | null>(null);
    const [completingAppId, setCompletingAppId] = useState<string | null>(null);
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [outcomeText, setOutcomeText] = useState('');
    
    const logScrollRef = useRef<HTMLDivElement>(null);

    // Persistence
    useEffect(() => {
        const savedJournal = localStorage.getItem('somalipin_journal');
        const savedTasks = localStorage.getItem('somalipin_myday');
        const savedAppointments = localStorage.getItem('somalipin_appointments');
        const savedNetworking = localStorage.getItem('somalipin_networking');
        const savedFinance = localStorage.getItem('somalipin_finance');
        const savedBrainDump = localStorage.getItem('somalipin_braindump_entries');

        if (savedJournal) try { setJournalEntries(JSON.parse(savedJournal)); } catch (e) {}
        if (savedTasks) try { setMyDayTasks(JSON.parse(savedTasks)); } catch (e) {}
        if (savedAppointments) try { setAppointments(JSON.parse(savedAppointments)); } catch (e) {}
        if (savedNetworking) try { setNetworkingContacts(JSON.parse(savedNetworking)); } catch (e) {}
        if (savedFinance) try { setFinanceEntries(JSON.parse(savedFinance)); } catch (e) {}
        if (savedBrainDump) try { setBrainDumpEntries(JSON.parse(savedBrainDump)); } catch (e) {}

        addLog("System initialized. Somalipin Operations Hub online.", "info");
    }, []);

    useEffect(() => {
        localStorage.setItem('somalipin_journal', JSON.stringify(journalEntries));
        localStorage.setItem('somalipin_myday', JSON.stringify(myDayTasks));
        localStorage.setItem('somalipin_appointments', JSON.stringify(appointments));
        localStorage.setItem('somalipin_networking', JSON.stringify(networkingContacts));
        localStorage.setItem('somalipin_finance', JSON.stringify(financeEntries));
        localStorage.setItem('somalipin_braindump_entries', JSON.stringify(brainDumpEntries));
    }, [journalEntries, myDayTasks, appointments, networkingContacts, financeEntries, brainDumpEntries]);

    useEffect(() => {
        if (logScrollRef.current) {
            logScrollRef.current.scrollTop = logScrollRef.current.scrollHeight;
        }
    }, [systemLogs]);

    const addLog = (message: string, type: SystemLog['type'] = 'info') => {
        const newLog: SystemLog = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            message,
            type
        };
        setSystemLogs(prev => [...prev.slice(-49), newLog]);
    };

    const todayStats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const entries = journalEntries.filter(e => e.date === todayStr);
        const tasks = entries.reduce((acc, curr) => acc + curr.tasks_completed, 0);
        return { entries, tasks };
    }, [journalEntries]);

    const financeSummary = useMemo(() => {
        return financeEntries.reduce((acc, curr) => {
            if (curr.type === 'income') acc.income += curr.amount;
            else acc.expense += curr.amount;
            acc.balance = acc.income - acc.expense;
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }, [financeEntries]);

    const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newTask: MyDayTask = {
            id: Date.now().toString(),
            taskName: formData.get('taskName') as string,
            assignee: formData.get('assignee') as string,
            phone: formData.get('phone') as string,
            startTime: formData.get('startTime') as string,
            deadline: formData.get('deadline') as string,
            status: 'pending',
            priority: formData.get('priority') as any || 'medium'
        };
        setMyDayTasks([...myDayTasks, newTask]);
        addLog(`New task assigned to ${newTask.assignee}: ${newTask.taskName}`, "success");
        setShowTaskForm(false);
    };

    const handleAddAppointment = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newAppointment: Appointment = {
            id: Date.now().toString(),
            personName: formData.get('personName') as string,
            phone: formData.get('phone') as string,
            purpose: formData.get('purpose') as string,
            time: formData.get('time') as string,
            location: formData.get('location') as string,
            status: 'scheduled'
        };
        setAppointments([...appointments, newAppointment]);
        addLog(`Balan cusub: ${newAppointment.personName} at ${newAppointment.time}`, "success");
        setShowAppointmentForm(false);
    };

    const handleAddNetworkingContact = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newContact: NetworkingContact = {
            id: Date.now().toString(),
            name: formData.get('name') as string,
            phone: formData.get('phone') as string,
            category: formData.get('category') as string || 'General',
            addedAt: new Date().toISOString()
        };
        setNetworkingContacts([...networkingContacts, newContact]);
        addLog(`Xiriir networking ah oo cusub: ${newContact.name}`, "success");
        setShowNetworkingForm(false);
    };

    const handleAddFinanceEntry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newEntry: FinanceEntry = {
            id: Date.now().toString(),
            description: formData.get('description') as string,
            amount: parseFloat(formData.get('amount') as string) || 0,
            type: formData.get('type') as 'income' | 'expense',
            category: formData.get('category') as string || 'General',
            date: new Date().toISOString()
        };
        setFinanceEntries([newEntry, ...financeEntries]);
        addLog(`Finance entry added: ${newEntry.description}`, "success");
        setShowFinanceForm(false);
    };

    const handleAddBrainThought = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBrainThought.trim()) return;
        const newEntry: BrainDumpEntry = {
            id: Date.now().toString(),
            text: currentBrainThought.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setBrainDumpEntries([newEntry, ...brainDumpEntries]);
        setCurrentBrainThought('');
        addLog("Fikrad cusub ayaa lagu tuuray Brain Dump-ka.", "info");
    };

    const handleSendNetworkingMsg = () => {
        if (!selectedContactForMsg || !networkingMsgDraft) return;
        const signature = "\n\n- Mohamed H Lafoole, CEO of Somalipin";
        const fullMsg = networkingMsgDraft + signature;
        const phone = selectedContactForMsg.phone.replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fullMsg)}`, '_blank');
        addLog(`Networking message loo diray: ${selectedContactForMsg.name}`, "success");
        setSelectedContactForMsg(null);
        setNetworkingMsgDraft('');
    };

    const handleAddJournal = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newEntry: JournalEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            achievements: formData.get('achievements') as string,
            challenges: "None",
            tasks_completed: parseInt(formData.get('tasks') as string) || 0,
            next_steps: formData.get('next_steps') as string,
            tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t)
        };
        setJournalEntries([newEntry, ...journalEntries]);
        addLog(`New journal entry saved for ${newEntry.date}`, "success");
        setView('journal-list');
    };

    const markAppointmentCompleted = (id: string) => {
        const updated = appointments.map(app => {
            if (app.id === id) {
                return { ...app, status: 'completed' as const, outcomeReport: outcomeText, completedAt: new Date().toLocaleTimeString() };
            }
            return app;
        });
        setAppointments(updated);
        addLog(`Balan waa la soo dhameeyay: ${appointments.find(a => a.id === id)?.personName}`, "success");
        setCompletingAppId(null);
        setOutcomeText('');
    };

    const markTaskCompleted = (id: string) => {
        const updated = myDayTasks.map(task => {
            if (task.id === id) {
                return { 
                    ...task, 
                    status: 'completed' as const, 
                    trackingNotes: outcomeText, 
                    completedAt: new Date().toLocaleTimeString() 
                };
            }
            return task;
        });
        setMyDayTasks(updated);
        const completedTask = myDayTasks.find(t => t.id === id);
        addLog(`Shaqo waa la dhameeyay: ${completedTask?.taskName}`, "success");
        setCompletingTaskId(null);
        setOutcomeText('');
    };

    const cancelAppointment = (id: string) => {
        if (!confirm("Ma hubtaa inaad baajiso balantan?")) return;
        const updated = appointments.map(app => {
            if (app.id === id) return { ...app, status: 'cancelled' as const };
            return app;
        });
        setAppointments(updated);
        addLog(`Balan waa la baajiyay: ${appointments.find(a => a.id === id)?.personName}`, "warning");
    };

    const sendWhatsAppThankYou = (app: Appointment) => {
        const message = `*MAHAD CELIN - SOMALIPIN*\n\nKu: ${app.personName}\n\nWaxaan kuugu mahadcelinaynaa balantii maanta dhacday ee ku saabsanayd: _${app.purpose}_.\n\n*Qodobadii lagu heshiiyay:* \n${app.outcomeReport || 'Wada hadal guul ku dhamaaday.'}\n\nWaxaan rajaynaynaa wada shaqayn wacan.\n\n_Somalipin Registry Disk Manager_`;
        const phoneStr = app.phone ? app.phone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const sendWhatsAppAppointmentNotification = (app: Appointment) => {
        const message = `*WARGELIN BALAN - SOMALIPIN*\n\nKu: ${app.personName}\n\nWaxaan halkaan kugula socodsiinaynaa in laguu diyaariyey balan:\n\n*Ujeedada:* ${app.purpose}\n*Xiliga:* ${app.time}\n*Goobta:* ${app.location}\n\nFadlan la soco xiliga balanta.\n\n_Somalipin Registry Disk Manager_`;
        const phoneStr = app.phone ? app.phone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const sendWhatsAppTaskAssignment = (task: MyDayTask) => {
        const message = `*SHAQO CUSUB - SOMALIPIN*\n\nKu: ${task.assignee}\n\nWaxaa laguuguu xil saaray shaqadaan: _${task.taskName}_\n\n*Faahfaahin:* \n- Bilowga: ${task.startTime}\n- Dhamaadka: ${task.deadline}\n- Mihiimada: ${task.priority.toUpperCase()}\n\nFadlan la soco shaqadaada.\n\n_Somalipin Registry Disk Manager_`;
        const phoneStr = task.phone ? task.phone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const sendWhatsAppTaskThankYou = (task: MyDayTask) => {
        const message = `*MAHAD CELIN SHAQO - SOMALIPIN*\n\nKu: ${task.assignee}\n\nWaxaan kuugu mahadcelinaynaa dhameystirka shaqadii laguu xilsaaray ee: _${task.taskName}_.\n\n*Warbixintii shaqada:* \n${task.trackingNotes || 'Si guul ah ayey u dhamaatay.'}\n\n_Somalipin Registry Disk Manager_`;
        const phoneStr = task.phone ? task.phone.replace(/\D/g, '') : '';
        window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const toggleTaskStatus = (id: string) => {
        const task = myDayTasks.find(t => t.id === id);
        if (task && task.status === 'pending') {
            setCompletingTaskId(id);
        } else if (task && task.status === 'completed') {
             setMyDayTasks(myDayTasks.map(t => t.id === id ? { ...t, status: 'pending' as const } : t));
        }
    };

    const handlePrintLetter = (task: MyDayTask) => {
        setTaskForLetter(task);
        setTimeout(() => {
            window.print();
            setTaskForLetter(null);
        }, 100);
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 print:hidden border-r border-slate-800/50
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                            <ShieldCheck size={26} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-xl leading-none tracking-tight text-white uppercase italic">SOMALIPIN</h1>
                            <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1.5 opacity-80">Full System Disk</p>
                        </div>
                    </div>

                    <div className="space-y-10 overflow-y-auto flex-1 pr-1 custom-scrollbar scroll-smooth">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-4 opacity-60">Daily Operations</p>
                            <nav className="space-y-1.5">
                                <button onClick={() => { setView('myday'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${view === 'myday' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Sun size={20} className={view === 'myday' ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} /> My Day
                                </button>
                                <button onClick={() => { setView('journal-new'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${view === 'journal-new' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    <PlusCircle size={20} className={view === 'journal-new' ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} /> Diwaan Cusub
                                </button>
                                <button onClick={() => { setView('journal-list'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${view === 'journal-list' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    <BookOpen size={20} className={view === 'journal-list' ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} /> Akhri Diwaan
                                </button>
                                <button onClick={() => { setView('journal-summary'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${view === 'journal-summary' ? 'bg-[#4f46e5] text-white shadow-xl shadow-indigo-600/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                                    <Activity size={20} className={view === 'journal-summary' ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} /> Koobid Maalinta
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-8 border-t border-slate-800/80">
                        <div className="flex items-center gap-4 px-5 py-3.5 bg-white/5 rounded-[20px] mb-6 animate-pulse-subtle">
                            <Activity size={18} className="text-indigo-400 animate-pulse" />
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-300">Operations Hub Active</p>
                        </div>
                        <div className="flex items-center gap-4 px-2 group cursor-pointer">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-[16px] bg-slate-800 flex items-center justify-center font-bold text-sm text-white border border-slate-700/50 shadow-lg group-hover:border-indigo-500/50 transition-colors">JD</div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[13px] font-bold truncate text-white leading-tight">Journal Desktop</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-0.5">System Manager</p>
                            </div>
                            <button className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 print:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md">
                        <Menu size={20} />
                    </button>
                    
                    <div className="flex-1 max-w-xl mx-4 relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search tasks, appointments or ideas..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-slate-50/50 print:p-0 print:bg-white relative">
                    
                    {/* View: My Day */}
                    {view === 'myday' && (
                        <div className="max-w-6xl mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-indigo-600">
                                        <Sun size={32} />
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">My Day</h2>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 overflow-x-auto custom-scrollbar pb-2">
                                        <button onClick={() => setMyDayTab('tasks')} className={`text-[10px] whitespace-nowrap font-black uppercase tracking-widest pb-2 border-b-2 transition-all shrink-0 ${myDayTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Hawlaha (Tasks)</button>
                                        <button onClick={() => setMyDayTab('appointments')} className={`text-[10px] whitespace-nowrap font-black uppercase tracking-widest pb-2 border-b-2 transition-all shrink-0 ${myDayTab === 'appointments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Balamaha (Appointments)</button>
                                        <button onClick={() => setMyDayTab('networking')} className={`text-[10px] whitespace-nowrap font-black uppercase tracking-widest pb-2 border-b-2 transition-all shrink-0 ${myDayTab === 'networking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Xiriir (Networking)</button>
                                        <button onClick={() => setMyDayTab('braindump')} className={`text-[10px] whitespace-nowrap font-black uppercase tracking-widest pb-2 border-b-2 transition-all shrink-0 ${myDayTab === 'braindump' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Brain Dump</button>
                                        <button onClick={() => setMyDayTab('finance')} className={`text-[10px] whitespace-nowrap font-black uppercase tracking-widest pb-2 border-b-2 transition-all shrink-0 ${myDayTab === 'finance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Finance</button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {myDayTab === 'tasks' && (
                                        <button onClick={() => setShowTaskForm(!showTaskForm)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><PlusCircle size={14} /> Hawl Cusub</button>
                                    )}
                                    {myDayTab === 'appointments' && (
                                        <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2"><UserCheck size={14} /> Balan Cusub</button>
                                    )}
                                    {myDayTab === 'networking' && (
                                        <button onClick={() => setShowNetworkingForm(!showNetworkingForm)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><UserPlus size={14} /> Xiriir Cusub</button>
                                    )}
                                    {myDayTab === 'finance' && (
                                        <button onClick={() => setShowFinanceForm(!showFinanceForm)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><Plus size={14} /> Entry Cusub</button>
                                    )}
                                </div>
                            </div>

                            {myDayTab === 'tasks' && (
                                <div className="space-y-6">
                                    {showTaskForm && (
                                        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-300">
                                            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Shaqada (Task)</label>
                                                    <input name="taskName" required placeholder="Description..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assignee</label>
                                                    <input name="assignee" required placeholder="Name..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number (WhatsApp)</label>
                                                    <input name="phone" placeholder="e.g. 25261XXXXXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deadline</label>
                                                    <input name="deadline" type="time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                                                    <select name="priority" defaultValue="medium" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                    </select>
                                                </div>
                                                <div className="lg:col-span-3 flex justify-end gap-3 pt-6">
                                                    <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Kaydi Hawsha</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {myDayTasks.map(task => (
                                            <div key={task.id} className={`bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between group gap-4 ${task.status === 'completed' ? 'opacity-70' : ''}`}>
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={`w-1 h-12 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className={`text-lg font-black text-slate-800 truncate ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>{task.taskName}</h4>
                                                            {task.status === 'completed' && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Dhamaystiran</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <p className="text-xs text-slate-400 font-bold uppercase truncate max-w-[150px]">{task.assignee}</p>
                                                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                                            <p className="text-xs text-slate-400 font-bold uppercase">{task.deadline}</p>
                                                        </div>
                                                        {task.status === 'completed' && task.trackingNotes && (
                                                            <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-2">
                                                                <Eye size={12} className="text-slate-400 mt-0.5" />
                                                                <p className="text-[10px] text-slate-500 font-medium italic">"{task.trackingNotes}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {task.status === 'pending' && (
                                                        <button onClick={() => sendWhatsAppTaskAssignment(task)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="U dir WhatsApp">
                                                            <Send size={18} />
                                                        </button>
                                                    )}
                                                    {task.status === 'completed' && (
                                                        <button onClick={() => sendWhatsAppTaskThankYou(task)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors" title="WhatsApp Mahadcelin">
                                                            <MessageCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handlePrintLetter(task)} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors" title="Print Letter">
                                                        <Printer size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleTaskStatus(task.id)} 
                                                        className={`p-3 rounded-xl transition-all ${task.status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-300 hover:text-emerald-500'}`}
                                                        title={task.status === 'completed' ? 'Dib u bilow' : 'Dhameey shaqada'}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button onClick={() => setMyDayTasks(myDayTasks.filter(t => t.id !== task.id))} className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {myDayTab === 'appointments' && (
                                <div className="space-y-6">
                                    {showAppointmentForm && (
                                        <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
                                            <form onSubmit={handleAddAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Magaca Qofka</label>
                                                    <input name="personName" required placeholder="Magaca..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number (WhatsApp)</label>
                                                    <input name="phone" placeholder="e.g. 25261XXXXXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Xiliga</label>
                                                    <input name="time" type="time" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ujeedo</label>
                                                    <input name="purpose" required placeholder="Ujeedada..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Goobta</label>
                                                    <input name="location" required placeholder="Halkay isugu imaanaysaan..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="md:col-span-2 flex justify-end pt-4">
                                                    <button type="submit" className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Kaydi Balanka</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {appointments.map(app => (
                                            <div key={app.id} className={`bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col md:flex-row items-stretch ${app.status === 'cancelled' ? 'opacity-50 grayscale' : ''}`}>
                                                <div className={`w-full md:w-28 flex flex-col items-center justify-center p-4 ${app.status === 'completed' ? 'bg-emerald-600 text-white' : app.status === 'cancelled' ? 'bg-slate-400 text-white' : 'bg-slate-900 text-white'}`}>
                                                    <p className="text-xl font-black">{app.time}</p>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest">{app.status.toUpperCase()}</p>
                                                </div>
                                                <div className="flex-1 p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-lg font-black text-slate-800 leading-none">{app.personName}</h4>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Ujeedo: {app.purpose}</p>
                                                            {app.phone && <p className="text-[9px] font-medium text-slate-400 mt-1 flex items-center gap-1"><Phone size={10}/> {app.phone}</p>}
                                                        </div>
                                                        {app.status === 'completed' && <ClipboardCheck size={20} className="text-emerald-500" />}
                                                    </div>
                                                    {app.status === 'completed' && app.outcomeReport && (
                                                        <p className="text-xs text-slate-600 italic font-medium">"{app.outcomeReport}"</p>
                                                    )}
                                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                                        <MapPin size={12} className="text-emerald-500" />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{app.location}</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 flex items-center justify-end border-t md:border-t-0 md:border-l border-slate-50 gap-2">
                                                    {app.status === 'scheduled' && (
                                                        <>
                                                            <button onClick={() => sendWhatsAppAppointmentNotification(app)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="U dir WhatsApp Notification">
                                                                <Send size={18} />
                                                            </button>
                                                            <button onClick={() => setCompletingAppId(app.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">Hirgali</button>
                                                            <button onClick={() => cancelAppointment(app.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><XCircle size={20} /></button>
                                                        </>
                                                    )}
                                                    {app.status === 'completed' && (
                                                        <button onClick={() => sendWhatsAppThankYou(app)} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200 transition-all">
                                                            <MessageCircle size={14} /> Mahadcelin
                                                        </button>
                                                    )}
                                                    <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {myDayTab === 'networking' && (
                                <div className="space-y-6 max-w-5xl mx-auto">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-6">
                                            {showNetworkingForm && (
                                                <div className="bg-white p-6 rounded-3xl border-2 border-indigo-100 shadow-xl animate-in zoom-in-95 duration-300">
                                                    <h3 className="text-sm font-black text-slate-800 uppercase mb-4 flex items-center gap-2"><UserPlus size={16} /> Diiwaangali Qof Cusub</h3>
                                                    <form onSubmit={handleAddNetworkingContact} className="space-y-4">
                                                        <input name="name" required placeholder="Magaca qofka..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                                                        <input name="phone" required placeholder="Lambarka WhatsApp (e.g. 25261...)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                                                        <div className="flex gap-2">
                                                            <input name="category" placeholder="Qaybta (Govt, Business...)" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm" />
                                                            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Save</button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {networkingContacts.length === 0 ? (
                                                    <div className="col-span-full py-12 bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                                        <Users size={48} strokeWidth={1} className="mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Eber xiriir (Empty Networking)</p>
                                                    </div>
                                                ) : (
                                                    networkingContacts.map(contact => (
                                                        <div key={contact.id} className={`bg-white p-5 rounded-[2rem] border transition-all group relative cursor-pointer ${selectedContactForMsg?.id === contact.id ? 'border-indigo-500 shadow-lg ring-4 ring-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`} onClick={() => setSelectedContactForMsg(contact)}>
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${selectedContactForMsg?.id === contact.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                                    {contact.name.charAt(0)}
                                                                </div>
                                                                <div className="flex-1 overflow-hidden">
                                                                    <h4 className="text-sm font-black text-slate-800 leading-none truncate">{contact.name}</h4>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{contact.phone}</p>
                                                                </div>
                                                                <button onClick={(e) => { e.stopPropagation(); setNetworkingContacts(networkingContacts.filter(c => c.id !== contact.id)); }} className="p-1.5 text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                                            </div>
                                                            <div className="mt-3 flex items-center justify-between">
                                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-slate-50 text-slate-400 rounded-lg">{contact.category || 'Networking'}</span>
                                                                {selectedContactForMsg?.id === contact.id ? <Check size={14} className="text-indigo-600" /> : <ChevronRight size={14} className="text-slate-300" />}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full md:w-[400px]">
                                            {selectedContactForMsg ? (
                                                <div className="bg-[#0f172a] text-white p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right-4 duration-500 relative flex flex-col h-full sticky top-4">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                                    <div className="relative z-10 flex flex-col h-full">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-sm text-white">
                                                                    <MessageSquare size={18} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-black uppercase tracking-tighter leading-none">Modern Composer</h3>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">To: {selectedContactForMsg.name}</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => setSelectedContactForMsg(null)} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Message Body</label>
                                                                <textarea 
                                                                    rows={8} 
                                                                    placeholder="Qor fariintaada networking-ka ah..." 
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 transition-all font-medium leading-relaxed custom-scrollbar"
                                                                    value={networkingMsgDraft}
                                                                    onChange={(e) => setNetworkingMsgDraft(e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1"><FileSignature size={10} /> Official Signature</p>
                                                                <p className="text-xs font-black text-indigo-400 italic leading-tight">
                                                                    - Mohamed H Lafoole, CEO of Somalipin
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={handleSendNetworkingMsg}
                                                                disabled={!networkingMsgDraft}
                                                                className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-[#128C7E] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                                                            >
                                                                <Send size={18} /> Dir WhatsApp
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white border-2 border-dashed border-slate-100 p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                                                    <div className="bg-slate-50 p-6 rounded-full mb-6">
                                                        <Link2 size={48} className="text-slate-200" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-slate-800 uppercase mb-2">Networking Active</h3>
                                                    <p className="text-xs text-slate-400 font-medium">Dooro qofka aad rabto inaad fariin u dirto si uu u furmo composer-ku.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {myDayTab === 'braindump' && (
                                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                                    <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                                                    <Lightbulb size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Thought Stream</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unstructured ideas and flash reminders.</p>
                                                </div>
                                            </div>
                                            
                                            <form onSubmit={handleAddBrainThought} className="relative mb-10">
                                                <input 
                                                    type="text" 
                                                    placeholder="Maxaa maskaxdaada ku soo dhacay hadda?" 
                                                    className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-50 rounded-[2rem] outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all text-lg font-medium pr-20 shadow-inner"
                                                    value={currentBrainThought}
                                                    onChange={(e) => setCurrentBrainThought(e.target.value)}
                                                />
                                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                                                    <ArrowUpRight size={24} />
                                                </button>
                                            </form>

                                            <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                                                {brainDumpEntries.length === 0 ? (
                                                    <div className="py-20 text-center text-slate-200">
                                                        <Brain size={64} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                                                        <p className="text-sm font-black uppercase tracking-widest">Lama hayo wax fikrado ah.</p>
                                                    </div>
                                                ) : (
                                                    brainDumpEntries.map(entry => (
                                                        <div key={entry.id} className="bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100 group relative hover:bg-white hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start gap-4">
                                                                <p className="text-slate-800 font-medium text-lg leading-relaxed">{entry.text}</p>
                                                                <button onClick={() => setBrainDumpEntries(brainDumpEntries.filter(e => e.id !== entry.id))} className="p-2 text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={16} /></button>
                                                            </div>
                                                            <div className="mt-3 flex items-center gap-2">
                                                                <Clock size={12} className="text-slate-300" />
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{entry.timestamp}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            
                                            {brainDumpEntries.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                                    <button onClick={() => setBrainDumpEntries([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Clear Stream</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {myDayTab === 'finance' && (
                                <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-emerald-500/5 transition-all">
                                            <div className="p-4 bg-emerald-50 rounded-[1.5rem] text-emerald-600 mb-4 group-hover:scale-110 transition-transform"><TrendingUp size={32} /></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Income</p>
                                            <p className="text-3xl font-black text-emerald-600 mt-2">${financeSummary.income.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-red-500/5 transition-all">
                                            <div className="p-4 bg-rose-50 rounded-[1.5rem] text-rose-600 mb-4 group-hover:scale-110 transition-transform"><TrendingDown size={32} /></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Expense</p>
                                            <p className="text-3xl font-black text-rose-600 mt-2">${financeSummary.expense.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-[#0f172a] p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -mt-20 group-hover:bg-indigo-500/20 transition-all"></div>
                                            <div className="relative z-10">
                                                <div className="p-4 bg-white/10 rounded-[1.5rem] text-indigo-400 mb-4 inline-block group-hover:rotate-12 transition-transform"><Calculator size={32} /></div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Balance</p>
                                                <p className={`text-3xl font-black mt-2 ${financeSummary.balance >= 0 ? 'text-white' : 'text-amber-400'}`}>
                                                    ${financeSummary.balance.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {showFinanceForm && (
                                        <div className="bg-white p-10 rounded-[3rem] border-2 border-indigo-100 shadow-2xl animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><Banknote size={20} /></div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">New Transaction</h3>
                                            </div>
                                            <form onSubmit={handleAddFinanceEntry} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason / Description</label>
                                                    <input name="description" required placeholder="Waxaad bixisay ama aad heshay..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-indigo-100 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount ($)</label>
                                                    <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-black text-xl focus:bg-white focus:border-indigo-100 transition-all" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type</label>
                                                    <select name="type" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-indigo-100 transition-all appearance-none cursor-pointer">
                                                        <option value="expense">Expense (Lacag Bixis)</option>
                                                        <option value="income">Income (Lacag Dakhli)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                                    <input name="category" placeholder="e.g. Office, Salary, Travel..." className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-sm focus:bg-white focus:border-indigo-100 transition-all" />
                                                </div>
                                                <div className="md:col-span-2 flex justify-end gap-4 pt-6">
                                                    <button type="button" onClick={() => setShowFinanceForm(false)} className="px-8 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors">Cancel</button>
                                                    <button type="submit" className="px-12 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">Save Official Ledger Entry</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="px-10 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Transaction Ledger</h4>
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{financeEntries.length} Entries</span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {financeEntries.length === 0 ? (
                                                <div className="py-24 text-center text-slate-300">
                                                    <Wallet size={64} strokeWidth={1} className="mx-auto mb-4 opacity-50" />
                                                    <p className="text-sm font-black uppercase tracking-widest">Eber Entries (Empty Ledger)</p>
                                                </div>
                                            ) : (
                                                financeEntries.map(entry => (
                                                    <div key={entry.id} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                                        <div className="flex items-center gap-6">
                                                            <div className={`p-4 rounded-2xl shadow-sm ${entry.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {entry.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-black text-slate-800 leading-none">{entry.description}</h4>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{entry.category}</span>
                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(entry.date).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-10">
                                                            <p className={`text-2xl font-black italic ${entry.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                                                            </p>
                                                            <button onClick={() => setFinanceEntries(financeEntries.filter(f => f.id !== entry.id))} className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: Journal List */}
                    {view === 'journal-list' && (
                        <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-500">
                             <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Shaqada Hore</h2>
                                <button onClick={() => setView('journal-new')} className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 flex items-center gap-2 uppercase tracking-widest transition-all">
                                    <PlusCircle size={16} /> New Log
                                </button>
                            </div>
                            <div className="space-y-6">
                                {journalEntries.length === 0 ? (
                                    <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                                        <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Ma jiro diwaan hore!</p>
                                    </div>
                                ) : (
                                    journalEntries.map(entry => (
                                        <div key={entry.id} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 group relative">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="bg-indigo-50 p-5 rounded-2xl text-indigo-600 shadow-inner"><Calendar size={28} /></div>
                                                    <div>
                                                        <p className="text-xl font-black text-slate-800">{new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            {entry.tags.map(tag => <span key={tag} className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-0.5 rounded">#{tag}</span>)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setJournalEntries(journalEntries.filter(e => e.id !== entry.id))} className="p-3 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-50 pt-8">
                                                <div><h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Achievements</h4><p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{entry.achievements}"</p></div>
                                                <div><h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2"><ArrowUpRight size={14} className="text-indigo-500" /> Next Steps</h4><p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{entry.next_steps}"</p></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Journal New */}
                    {view === 'journal-new' && (
                        <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="mb-10 flex items-center justify-between">
                                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Diwaan Cusub</h2>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <form onSubmit={handleAddJournal} className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-200 space-y-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="space-y-10 relative z-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guulaha Maanta (Achievements)</label>
                                        <textarea name="achievements" required rows={4} placeholder="Qor wixii maanta qabsoomay..." className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300 leading-relaxed" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tasks Done</label>
                                            <input name="tasks" type="number" defaultValue={0} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white transition-all outline-none font-black text-slate-800" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags (Separated by comma)</label>
                                            <input name="tags" placeholder="Phase1, Review..." className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white transition-all outline-none font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Talaabooyinka Xiga (Next Steps)</label>
                                        <textarea name="next_steps" required rows={2} placeholder="Maxaa xiga berri?" className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] focus:bg-white outline-none font-medium text-slate-800 leading-relaxed italic" />
                                    </div>
                                    <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3">
                                        <ClipboardList size={20} /> Save Official Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* View: Summary */}
                    {view === 'journal-summary' && (
                        <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-4">Koobid Maalinta</h2>
                                <p className="text-slate-500 font-medium tracking-wide">Daily Diagnostic overview for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"><p className="text-5xl font-black text-indigo-600 leading-none">{todayStats.tasks}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Tasks Done</p></div>
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"><p className="text-5xl font-black text-emerald-600 leading-none">{journalEntries.length}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">New Logs</p></div>
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"><p className="text-5xl font-black text-amber-500 leading-none">{todayStats.entries.length}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Session Logs</p></div>
                            </div>
                            <div className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 border-b border-slate-800 pb-6 flex items-center gap-4"><Activity size={20} className="text-indigo-500" /> Operational Analysis</h3>
                                {todayStats.entries.length > 0 ? (
                                    <div className="space-y-12">
                                        {todayStats.entries.map(entry => (
                                            <div key={entry.id} className="grid grid-cols-1 md:grid-cols-2 gap-12 border-l-2 border-slate-800 pl-8">
                                                <div className="space-y-3"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Achievements</p><p className="text-sm text-slate-300 leading-relaxed italic">"{entry.achievements}"</p></div>
                                                <div className="space-y-3"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Forward Trajectory</p><p className="text-sm text-indigo-400 leading-relaxed font-bold italic">"{entry.next_steps}"</p></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-20 text-slate-700 italic font-medium uppercase tracking-widest">No activity recorded today.</div>}
                            </div>
                        </div>
                    )}

                    {/* Completion Modal / Overlay for Tasks & Appointments */}
                    {(completingAppId || completingTaskId) && (
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Dabagal & Warbixin</h3>
                                    <button onClick={() => { setCompletingAppId(null); setCompletingTaskId(null); }} className="p-2 text-slate-400"><X size={24} /></button>
                                </div>
                                <p className="text-sm text-slate-500 mb-6 font-medium">Qor warbixin kooban oo ku saabsan waxa qabsoomay si loogu daro diwaanka rasmiga ah.</p>
                                <textarea 
                                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] min-h-[150px] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-800"
                                    placeholder="Qor halkaan warbixinta..."
                                    value={outcomeText}
                                    onChange={(e) => setOutcomeText(e.target.value)}
                                />
                                <div className="mt-8 flex gap-3">
                                    <button 
                                        onClick={() => {
                                            if (completingAppId) markAppointmentCompleted(completingAppId);
                                            if (completingTaskId) markTaskCompleted(completingTaskId);
                                        }}
                                        className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={18} /> Diiwaangali & Dhameey
                                    </button>
                                    <button onClick={() => { setCompletingAppId(null); setCompletingTaskId(null); }} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Letter View (Print Only) */}
                    {taskForLetter && (
                        <div className="hidden print:block fixed inset-0 bg-white z-[100] p-16">
                            <div className="max-w-4xl mx-auto border-[2px] border-slate-900 p-16 min-h-screen flex flex-col">
                                <div className="border-b-[4px] border-slate-900 pb-10 mb-12">
                                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">SOMALIPIN</h1>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.5em] mt-2">Official Assignment Letter</p>
                                </div>
                                <div className="space-y-12 flex-1">
                                    <div className="grid grid-cols-2 gap-12">
                                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">To Recipient</p><p className="text-2xl font-black text-slate-900 underline underline-offset-8">{taskForLetter.assignee}</p></div>
                                        <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Priority Level</p><p className="text-xl font-black uppercase text-red-600">{taskForLetter.priority}</p></div>
                                    </div>
                                    <div className="py-12 border-y border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Subject</p>
                                        <h3 className="text-3xl font-black text-slate-900 leading-tight">"{taskForLetter.taskName}"</h3>
                                        <div className="grid grid-cols-2 gap-8 mt-10">
                                            <div className="p-6 bg-slate-50 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Start Time</p><p className="text-2xl font-black text-slate-800">{taskForLetter.startTime}</p></div>
                                            <div className="p-6 bg-slate-50 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Deadline</p><p className="text-2xl font-black text-slate-800">{taskForLetter.deadline}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-20 flex justify-between items-center pt-10 border-t border-slate-200">
                                    <div className="space-y-8"><div className="w-48 h-px bg-slate-400"></div><p className="text-[10px] font-black text-slate-500 uppercase">Registry Unit Signature</p></div>
                                    <div className="text-right font-mono text-[10px] font-black uppercase tracking-widest text-slate-300">Phase 1 Operations Unit</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden print:hidden" onClick={() => setMobileMenuOpen(false)}></div>}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    aside, header, button, .print\\:hidden { display: none !important; }
                    main { width: 100% !important; height: auto !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
                    .hidden.print\\:block { display: block !important; position: static !important; }
                    body { background-color: white !important; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(0.99); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
};

export default App;