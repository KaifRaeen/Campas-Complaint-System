export type Role = 'student' | 'admin';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type Status =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export interface User {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  role: Role;
  studentId?: string | null;
  departmentId?: number | null;
  year?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  icon: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Attachment {
  id: number;
  complaintId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  createdAt: string;
}

export interface ComplaintUpdate {
  id: number;
  complaintId: number;
  userId: string;
  userName: string;
  userRole: string;
  oldStatus?: string | null;
  newStatus: Status;
  message: string;
  createdAt: string;
}

export interface InternalNote {
  id: number;
  complaintId: number;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface Complaint {
  id: number;
  complaintNumber: string;
  studentId: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: Status;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  departmentId?: number | null;
  departmentName?: string;
  studentName?: string;
  studentRoll?: string | null;
  studentEmail?: string;
  studentPhone?: string | null;
  studentYear?: string | null;
  studentAvatar?: string | null;
  updates?: ComplaintUpdate[];
  attachments?: Attachment[];
  internalNotes?: InternalNote[];
}

export interface NotificationItem {
  id: number;
  complaintId?: number | null;
  complaintNumber?: string | null;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export interface AnalyticsData {
  metrics: {
    total: number;
    resolved: number;
    newComplaints: number;
    underReview: number;
    inProgress: number;
    urgent: number;
    resolutionRate: number;
    averageResolutionHours: number;
  };
  statusBreakdown: { status: Status; count: number }[];
  priorityBreakdown: { priority: Priority; count: number }[];
  categoryBreakdown: { categoryName: string; count: number }[];
  departmentBreakdown: { departmentName: string; total: number; resolved: number }[];
  trends: { date: string; count: number }[];
}
