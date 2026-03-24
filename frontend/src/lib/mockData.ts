// Mock data service

const generateId = () => Math.random().toString(36).substr(2, 9);

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  hourlyRate: number;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
}

export interface TimeEntry {
  id: string;
  worklogId: string;
  date: string;
  hoursLogged: number;
  description?: string;
}

export interface Worklog {
  id: string;
  freelancerId: string;
  taskId: string;
  totalHours: number;
  totalEarnings: number;
  freelancer?: Freelancer;
  task?: Task;
  timeEntries: TimeEntry[];
}

const freelancers: Freelancer[] = [
  {
    id: generateId(),
    name: "Alice Johnson",
    email: "alice@freelance.io",
    hourlyRate: 50
  },
  {
    id: generateId(),
    name: "Bob Smith",
    email: "bob@freelance.io",
    hourlyRate: 45
  },
  {
    id: generateId(),
    name: "Carol White",
    email: "carol@freelance.io",
    hourlyRate: 60
  }
];

const tasks: Task[] = [
  {
    id: generateId(),
    name: "Frontend Development",
    description: "React & Next.js implementations"
  },
  {
    id: generateId(),
    name: "API Integration",
    description: "Backend API endpoint development"
  },
  {
    id: generateId(),
    name: "Database Design",
    description: "Schema design and optimization"
  }
];

// Generate mock worklogs and time entries
const generateMockWorklogs = (): Worklog[] => {
  const worklogs: Worklog[] = [];
  const now = new Date();
  
  for (let i = 0; i < 5; i++) {
    const freelancer = freelancers[i % freelancers.length];
    const task = tasks[i % tasks.length];
    const worklogId = generateId();
    
    // Generate 3-5 time entries per worklog
    const timeEntries: TimeEntry[] = [];
    const numEntries = Math.floor(Math.random() * 3) + 3;
    let totalHours = 0;
    
    for (let j = 0; j < numEntries; j++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (4 - j));
      const hours = Math.floor(Math.random() * 8) + 2;
      totalHours += hours;
      
      timeEntries.push({
        id: generateId(),
        worklogId,
        date: date.toISOString().split('T')[0],
        hoursLogged: hours,
        description: `Work on ${task.name}`
      });
    }
    
    const totalEarnings = totalHours * freelancer.hourlyRate;
    
    worklogs.push({
      id: worklogId,
      freelancerId: freelancer.id,
      taskId: task.id,
      totalHours,
      totalEarnings,
      freelancer,
      task,
      timeEntries: timeEntries.sort((a, b) => a.date.localeCompare(b.date))
    });
  }
  
  return worklogs;
};

export const mockWorklogs = generateMockWorklogs();

export const getMockWorklogs = (): Worklog[] => {
  return mockWorklogs;
};

export const getMockWorklogById = (id: string): Worklog | undefined => {
  return mockWorklogs.find(w => w.id === id);
};

export const filterWorklogsByDateRange = (
  startDate: string,
  endDate: string
): Worklog[] => {
  return mockWorklogs.filter(worklog => {
    return worklog.timeEntries.some(entry => {
      return entry.date >= startDate && entry.date <= endDate;
    });
  });
};

export const calculatePaymentBatch = (
  worklogIds: string[],
  excludedWorklogIds: string[] = [],
  excludedFreelancerIds: string[] = []
): {
  totalAmount: number;
  worklogCount: number;
  freelancerCount: number;
  entryCount: number;
  worklogDetails: Array<{ worklog: Worklog; amount: number }>;
} => {
  let totalAmount = 0;
  let entryCount = 0;
  const freelancerIds = new Set<string>();
  const worklogDetails = [];
  
  for (const worklogId of worklogIds) {
    if (excludedWorklogIds.includes(worklogId)) continue;
    
    const worklog = getMockWorklogById(worklogId);
    if (!worklog) continue;
    if (excludedFreelancerIds.includes(worklog.freelancerId)) continue;
    
    totalAmount += worklog.totalEarnings;
    entryCount += worklog.timeEntries.length;
    freelancerIds.add(worklog.freelancerId);
    worklogDetails.push({ worklog, amount: worklog.totalEarnings });
  }
  
  return {
    totalAmount,
    worklogCount: worklogDetails.length,
    freelancerCount: freelancerIds.size,
    entryCount,
    worklogDetails
  };
};
