export enum RecordStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    UNDER_REVIEW = "under_review"
}

export enum RecordCategory {
    NATIONAL_REGISTRY = "National Registry",
    PUBLIC_INSTITUTIONS = "Public Institutions",
    NGOS = "NGOs",
    BUSINESS = "Business",
    PIONEERS = "Pioneers",
    EXPLORERS = "Explorers"
}

export interface SomalipinRecord {
    id: string;
    name: string;
    category: RecordCategory;
    status: RecordStatus;
    ai_score?: number;
    description: string;
    sector: string;
    phase: number;
    last_reviewed?: string;
    gemini_result?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    achievements: string;
    challenges: string;
    tasks_completed: number;
    next_steps: string;
    tags: string[];
}

export interface ProgressStats {
    verified: number;
    pending: number;
    under_review: number;
    total_records: number;
    progress_percentage: number;
    remaining: number;
    target: number;
}

export interface SystemLog {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'ai';
}

export interface MyDayTask {
    id: string;
    taskName: string;
    assignee: string;
    phone?: string;
    startTime: string;
    deadline: string;
    status: 'pending' | 'completed' | 'missed';
    priority: 'low' | 'medium' | 'high';
    trackingNotes?: string;
    completedAt?: string;
}

export interface Appointment {
    id: string;
    personName: string;
    phone?: string;
    purpose: string;
    time: string;
    location: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    outcomeReport?: string;
    completedAt?: string;
}

export interface NetworkingContact {
    id: string;
    name: string;
    phone: string;
    category?: string;
    addedAt: string;
}

export interface FinanceEntry {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

export interface BrainDumpEntry {
    id: string;
    text: string;
    timestamp: string;
}