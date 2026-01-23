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
    Phone
} from 'lucide-react';
import { RecordStatus, RecordCategory, SomalipinRecord, ProgressStats, JournalEntry, SystemLog, MyDayTask, Appointment } from './types.ts';
import StatCard from './components/StatCard.tsx';
import Charts from './components/Charts.tsx';
import { performDeepReview } from './services/geminiService.ts';

const SAMPLE_RECORDS: SomalipinRecord[] = [
    {
        id: "SP-6434",
        name: "Mohamed Abdulkadir (Ugaska)",
        category: RecordCategory.NATIONAL_REGISTRY,
        status: RecordStatus.PENDING,
        ai_score: 95,
        description: "XILDHIBAAN GOLAHA SHACABKA EE BJFS",
        sector: "Politics",
        phase: 1,
        gemini_result: "Mohamed Abdulkadir, commonly known as Ugaska, is a verified Member of the House of the People of the Federal Parliament of Somalia."
    },
    {
        id: "SP-6435",
        name: "Xildhibaan Zadek Omar Hassan",
        category: RecordCategory.NATIONAL_REGISTRY,
        status: RecordStatus.PENDING,
        ai_score: 95,
        description: "XILDHIBAAN GOLAHA SHACABKA",
        sector: "Politics",
        phase: 1
    },
    {
        id: "SP-6436",
        name: "Warshada biyaha Caafi",
        category: RecordCategory.BUSINESS,
        status: RecordStatus.PENDING,
        ai_score: 85,
        description: "Warshada biyaha Caafi - Mineral Water Production",
        sector: "Business",
        phase: 1
    },
    {
        id: "SP-6437",
        name: "Dr. Aamina Sheikh",
        category: RecordCategory.NATIONAL_REGISTRY,
        status: RecordStatus.VERIFIED,
        ai_score: 98,
        description: "Wasaaradda Caafimaadka Senior Advisor",
        sector: "Health",
        phase: 1,
        last_reviewed: "2024-03-20 10:30:00"
    },
    {
        id: "SP-6438",
        name: "Prof. Ahmed Yusuf",
        category: RecordCategory.PUBLIC_INSTITUTIONS,
        status: RecordStatus.VERIFIED,
        ai_score: 92,
        description: "Jaamacadda Ummada Academic Board",
        sector: "Education",
        phase: 1,
        last_reviewed: "2024-03-19 14:15:00"
    }
];

const TARGET_GOAL = 401;

type AppView = 'journal-new' | 'journal-list' | 'journal-summary' | 'report' | 'profiles' | 'dashboard' | 'queue' | 'add' | 'myday';
type MyDayTab = 'tasks' | 'appointments';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('dashboard');
    const [myDayTab, setMyDayTab] = useState<MyDayTab>('tasks');
    const [records, setRecords] = useState<SomalipinRecord[]>(SAMPLE_RECORDS);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [myDayTasks, setMyDayTasks] = useState<MyDayTask[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<RecordCategory | 'all'>('all');
    const [selectedRecord, setSelectedRecord] = useState<SomalipinRecord | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [taskForLetter, setTaskForLetter] = useState<MyDayTask | null>(null);
    const [completingAppId, setCompletingAppId] = useState<string | null>(null);
    const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
    const [outcomeText, setOutcomeText] = useState('');
    
    const logScrollRef = useRef<HTMLDivElement>(null);

    // Persistence
    useEffect(() => {
        const savedRecords = localStorage.getItem('somalipin_records');
        const savedJournal = localStorage.getItem('somalipin_journal');
        const savedTasks = localStorage.getItem('somalipin_myday');
        const savedAppointments = localStorage.getItem('somalipin_appointments');
        if (savedRecords) try { setRecords(JSON.parse(savedRecords)); } catch (e) {}
        if (savedJournal) try { setJournalEntries(JSON.parse(savedJournal)); } catch (e) {}
        if (savedTasks) try { setMyDayTasks(JSON.parse(savedTasks)); } catch (e) {}
        if (savedAppointments) try { setAppointments(JSON.parse(savedAppointments)); } catch (e) {}
        addLog("System initialized. Phase 1 Internal Manager ready.", "info");
    }, []);

    useEffect(() => {
        localStorage.setItem('somalipin_records', JSON.stringify(records));
        localStorage.setItem('somalipin_journal', JSON.stringify(journalEntries));
        localStorage.setItem('somalipin_myday', JSON.stringify(myDayTasks));
        localStorage.setItem('somalipin_appointments', JSON.stringify(appointments));
    }, [records, journalEntries, myDayTasks, appointments]);

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

    const stats: ProgressStats = useMemo(() => {
        const verified = records.filter(r => r.status === RecordStatus.VERIFIED).length;
        const pending = records.filter(r => r.status === RecordStatus.PENDING).length;
        const under_review = records.filter(r => r.status === RecordStatus.UNDER_REVIEW).length;
        return {
            verified,
            pending,
            under_review,
            total_records: records.length,
            progress_percentage: (verified / TARGET_GOAL) * 100,
            remaining: TARGET_GOAL - verified,
            target: TARGET_GOAL
        };
    }, [records]);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 r.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [records, searchTerm, statusFilter, categoryFilter]);

    const todayStats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const entries = journalEntries.filter(e => e.date === todayStr);
        const tasks = entries.reduce((acc, curr) => acc + curr.tasks_completed, 0);
        const newlyVerified = records.filter(r => r.status === RecordStatus.VERIFIED && r.last_reviewed?.includes(todayStr)).length;
        return { entries, tasks, newlyVerified };
    }, [journalEntries, records]);

    const handleAddRecord = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const category = formData.get('category') as RecordCategory;
        const sector = formData.get('sector') as string;
        const description = formData.get('description') as string;

        const newId = `SP-${Math.max(...records.map(r => parseInt(r.id.split('-')[1]) || 0), 6438) + 1}`;
        
        const newRecord: SomalipinRecord = {
            id: newId,
            name,
            category,
            sector,
            description,
            status: RecordStatus.PENDING,
            phase: 1
        };

        setRecords([newRecord, ...records]);
        addLog(`Added new record: ${name} (${newId})`, "success");
        setView('queue');
    };

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

    const verifyRecord = (id: string) => {
        const record = records.find(r => r.id === id);
        if (!confirm(`Are you sure you want to verify ${record?.name}?`)) return;
        const updated = records.map(r => r.id === id ? { 
            ...r, 
            status: RecordStatus.VERIFIED, 
            last_reviewed: new Date().toISOString().replace('T', ' ').split('.')[0] 
        } : r);
        setRecords(updated);
        setSelectedRecord(updated.find(r => r.id === id) || null);
        addLog(`Official Verification successful: ${record?.name}`, "success");
    };

    const runAIReview = async (record: SomalipinRecord) => {
        setIsReviewing(true);
        addLog(`Initiating AI Deep Review for ${record.name}...`, "ai");
        try {
            const result = await performDeepReview(record.name, record.description, record.category);
            const updatedRecords = records.map(r => 
                r.id === record.id ? { 
                    ...r, 
                    ai_score: result.score, 
                    gemini_result: result.analysis, 
                    sector: result.sectorSuggestion || r.sector,
                    status: RecordStatus.UNDER_REVIEW,
                    last_reviewed: new Date().toISOString().replace('T', ' ').split('.')[0]
                } : r
            );
            setRecords(updatedRecords);
            setSelectedRecord(updatedRecords.find(r => r.id === record.id) || null);
            addLog(`Deep Review complete: Confidence ${result.score}% for ${record.name}`, "ai");
        } catch (e) {
            addLog(`Deep Review failed for ${record.name}`, "warning");
        } finally {
            setIsReviewing(false);
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
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 print:hidden
            `}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none tracking-tight text-white">SOMALIPIN</h1>
                            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">Full System Disk</p>
                        </div>
                    </div>

                    <div className="space-y-8 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-4">Daily Operations</p>
                            <nav className="space-y-1">
                                <button onClick={() => { setView('myday'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'myday' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <Sun size={18} /> My Day
                                </button>
                                <button onClick={() => { setView('journal-new'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'journal-new' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <PlusCircle size={18} /> Diwaan Cusub
                                </button>
                                <button onClick={() => { setView('journal-list'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'journal-list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <BookOpen size={18} /> Akhri Diwaan
                                </button>
                                <button onClick={() => { setView('journal-summary'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'journal-summary' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <Activity size={18} /> Koobid Maalinta
                                </button>
                            </nav>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-4">Registry Core</p>
                            <nav className="space-y-1">
                                <button onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </button>
                                <button onClick={() => { setView('queue'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'queue' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <Search size={18} /> Review Queue
                                </button>
                                <button onClick={() => { setView('profiles'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'profiles' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <Users size={18} /> Profiles Tracker
                                </button>
                                <button onClick={() => { setView('report'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${view === 'report' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                    <FileBarChart size={18} /> System Reports
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl mb-4">
                            <Activity size={16} className="text-indigo-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Phase 1 Active</p>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-600">JD</div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-semibold truncate text-white">Journal Desktop</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">System Manager</p>
                            </div>
                            <LogOut size={16} className="text-slate-500 cursor-pointer hover:text-red-400" />
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
                            placeholder="Search records, tasks or logs..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Verified: {stats.verified} / {TARGET_GOAL}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${stats.progress_percentage}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-slate-700">{stats.progress_percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-slate-50/50 print:p-0 print:bg-white relative">
                    
                    {/* View: Dashboard */}
                    {view === 'dashboard' && (
                        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">System Dashboard</h2>
                                    <p className="text-sm text-slate-500 font-medium">Internal metrics for Somalia National Registry Phase 1.</p>
                                </div>
                                <button onClick={() => setView('queue')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                                    Review Terminal <Terminal size={16} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Entities" value={stats.total_records} icon={<PieChart size={24} />} colorClass="text-slate-600" />
                                <StatCard label="Verified" value={stats.verified} icon={<CheckCircle2 size={24} />} colorClass="text-emerald-600" />
                                <StatCard label="Under Review" value={stats.under_review} icon={<Activity size={24} />} colorClass="text-indigo-600" />
                                <StatCard label="Goal Remaining" value={stats.remaining} icon={<Clock size={24} />} colorClass="text-amber-600" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Charts records={records} />
                                </div>
                                <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-800 flex flex-col min-h-[300px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Terminal size={14} /> System Logs
                                        </h3>
                                    </div>
                                    <div ref={logScrollRef} className="flex-1 overflow-y-auto space-y-2 font-mono custom-scrollbar pr-2">
                                        {systemLogs.map(log => (
                                            <div key={log.id} className="text-[10px] leading-relaxed">
                                                <span className="text-slate-600">[{log.timestamp}]</span>{' '}
                                                <span className={`
                                                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                                                    ${log.type === 'ai' ? 'text-indigo-400' : ''}
                                                    ${log.type === 'warning' ? 'text-amber-400' : ''}
                                                    ${log.type === 'info' ? 'text-slate-400' : ''}
                                                `}>{log.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: My Day */}
                    {view === 'myday' && (
                        <div className="max-w-6xl mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-indigo-600">
                                        <Sun size={32} />
                                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">My Day</h2>
                                    </div>
                                    <div className="flex items-center gap-6 mt-4">
                                        <button onClick={() => setMyDayTab('tasks')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${myDayTab === 'tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Hawlaha (Tasks)</button>
                                        <button onClick={() => setMyDayTab('appointments')} className={`text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${myDayTab === 'appointments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>Balamaha (Appointments)</button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {myDayTab === 'tasks' ? (
                                        <button onClick={() => setShowTaskForm(!showTaskForm)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><PlusCircle size={14} /> Hawl Cusub</button>
                                    ) : (
                                        <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2"><UserCheck size={14} /> Balan Cusub</button>
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
                        </div>
                    )}

                    {/* View: Review Queue */}
                    {view === 'queue' && (
                        <div className="max-w-7xl mx-auto flex flex-col h-full gap-6 animate-in fade-in duration-500">
                             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Review Queue</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Verification terminal active.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                                        <Filter size={14} className="text-slate-400" />
                                        <select className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-700" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                                            <option value="all">Dhamaan (All)</option>
                                            <option value={RecordStatus.PENDING}>Pending</option>
                                            <option value={RecordStatus.UNDER_REVIEW}>Under Review</option>
                                            <option value={RecordStatus.VERIFIED}>Verified</option>
                                        </select>
                                    </div>
                                    <button onClick={() => setView('add')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">Add Record</button>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Info</th>
                                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AI Match</th>
                                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredRecords.map(record => (
                                                    <tr key={record.id} className={`hover:bg-indigo-50/50 cursor-pointer transition-all ${selectedRecord?.id === record.id ? 'bg-indigo-50' : ''}`} onClick={() => setSelectedRecord(record)}>
                                                        <td className="px-6 py-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">{record.name.charAt(0)}</div>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-800">{record.name}</p>
                                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{record.id} • {record.sector}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-6 text-center">
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-1 rounded-lg">{record.category}</span>
                                                        </td>
                                                        <td className="px-6 py-6 text-center">
                                                            {record.ai_score ? <span className={`text-xs font-black ${record.ai_score >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{record.ai_score}%</span> : <span className="text-slate-200 text-xs font-black">---</span>}
                                                        </td>
                                                        <td className="px-6 py-6 text-right">
                                                            <ChevronRight size={18} className="text-slate-300 inline" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {selectedRecord && (
                                    <div className="w-full lg:w-[450px] bg-white rounded-3xl shadow-xl border border-slate-200 p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-600 uppercase mb-1 block">{selectedRecord.id}</span>
                                                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{selectedRecord.name}</h3>
                                            </div>
                                            <button onClick={() => setSelectedRecord(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={20} /></button>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                                <p className="text-xs font-black text-slate-800 uppercase">{selectedRecord.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Registry Description</p>
                                                <p className="text-sm text-slate-600 bg-indigo-50/20 p-5 rounded-2xl border border-indigo-100 italic leading-relaxed">"{selectedRecord.description}"</p>
                                            </div>
                                            {selectedRecord.gemini_result ? (
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center"><span className="text-xs font-black text-slate-700">AI Deep Analysis</span><span className="text-xl font-black text-indigo-600">{selectedRecord.ai_score}%</span></div>
                                                    <div className="p-5 bg-slate-900 text-slate-300 rounded-2xl text-xs leading-relaxed font-medium italic shadow-2xl border border-slate-800">{selectedRecord.gemini_result}</div>
                                                </div>
                                            ) : (
                                                <button disabled={isReviewing} onClick={() => runAIReview(selectedRecord)} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                                                    {isReviewing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Initiate Deep Review'}
                                                </button>
                                            )}
                                            {selectedRecord.status !== RecordStatus.VERIFIED && (
                                                <button onClick={() => verifyRecord(selectedRecord.id)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={16} /> Official Verification
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Profiles Grid */}
                    {view === 'profiles' && (
                        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Profiles Tracker</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {records.map(profile => (
                                    <div key={profile.id} className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col cursor-pointer" onClick={() => { setView('queue'); setSelectedRecord(profile); }}>
                                        <div className="h-20 bg-slate-900 relative p-6 flex items-end">
                                            <span className="text-[10px] font-black text-slate-400 uppercase relative z-10">{profile.id}</span>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        </div>
                                        <div className="p-6 pt-10 relative flex-1">
                                            <div className="absolute -top-10 left-6 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center font-black text-2xl text-slate-800">{profile.name.charAt(0)}</div>
                                            <h4 className="text-lg font-black text-slate-800 leading-tight mb-1">{profile.name}</h4>
                                            <p className="text-[10px] font-black text-indigo-600 uppercase mb-4 tracking-tighter">{profile.sector}</p>
                                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed italic border-l-2 border-slate-100 pl-3">"{profile.description}"</p>
                                        </div>
                                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${profile.status === RecordStatus.VERIFIED ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{profile.status}</span>
                                            <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"><p className="text-5xl font-black text-emerald-600 leading-none">{todayStats.newlyVerified}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Newly Verified</p></div>
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
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default App;