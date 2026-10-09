import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  icon: text('icon').notNull().default('AlertCircle'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('student'), // 'student' | 'admin'
  studentId: text('student_id'),
  departmentId: integer('department_id').references(() => departments.id),
  year: text('year'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const complaints = pgTable('complaints', {
  id: serial('id').primaryKey(),
  complaintNumber: text('complaint_number').notNull().unique(),
  studentId: text('student_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  location: text('location').notNull(),
  priority: text('priority').notNull().default('Medium'), // 'Low' | 'Medium' | 'High' | 'Urgent'
  status: text('status').notNull().default('Submitted'), // 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected' | 'Reopened'
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const complaintUpdates = pgTable('complaint_updates', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id').references(() => complaints.id).notNull(),
  userId: text('user_id').references(() => users.uid).notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  oldStatus: text('old_status'),
  newStatus: text('new_status').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const attachments = pgTable('attachments', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id').references(() => complaints.id).notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  complaintId: integer('complaint_id').references(() => complaints.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  type: text('type').default('status_update'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const internalNotes = pgTable('internal_notes', {
  id: serial('id').primaryKey(),
  complaintId: integer('complaint_id').references(() => complaints.id).notNull(),
  authorId: text('author_id').references(() => users.uid).notNull(),
  authorName: text('author_name').notNull(),
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  complaints: many(complaints),
  students: many(users),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  complaints: many(complaints),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  complaints: many(complaints),
  notifications: many(notifications),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  student: one(users, {
    fields: [complaints.studentId],
    references: [users.uid],
  }),
  category: one(categories, {
    fields: [complaints.categoryId],
    references: [categories.id],
  }),
  department: one(departments, {
    fields: [complaints.departmentId],
    references: [departments.id],
  }),
  updates: many(complaintUpdates),
  attachments: many(attachments),
  notifications: many(notifications),
  internalNotes: many(internalNotes),
}));

export const complaintUpdatesRelations = relations(complaintUpdates, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintUpdates.complaintId],
    references: [complaints.id],
  }),
  user: one(users, {
    fields: [complaintUpdates.userId],
    references: [users.uid],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  complaint: one(complaints, {
    fields: [attachments.complaintId],
    references: [complaints.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  complaint: one(complaints, {
    fields: [notifications.complaintId],
    references: [complaints.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.uid],
  }),
}));

export const internalNotesRelations = relations(internalNotes, ({ one }) => ({
  complaint: one(complaints, {
    fields: [internalNotes.complaintId],
    references: [complaints.id],
  }),
  author: one(users, {
    fields: [internalNotes.authorId],
    references: [users.uid],
  }),
}));
