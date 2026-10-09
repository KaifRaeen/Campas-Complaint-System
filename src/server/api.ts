import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import {
  complaints,
  complaintUpdates,
  attachments,
  categories,
  departments,
  notifications,
  users,
  internalNotes,
} from '../db/schema.ts';
import { eq, desc, asc, and, sql, or, like } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// ==========================================
// AUTH & USERS
// ==========================================

// Get current user profile
router.get('/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userList = await db
      .select({
        id: users.id,
        uid: users.uid,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        studentId: users.studentId,
        departmentId: users.departmentId,
        year: users.year,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.uid, req.user!.uid))
      .limit(1);

    if (userList.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(userList[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Sync or register user profile
router.post('/auth/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, studentId, departmentId, year, phone, avatarUrl, role } = req.body;
    const uid = req.user!.uid;
    const email = req.user!.email || `${uid}@campusvoice.edu`;

    const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          fullName: fullName || existing[0].fullName,
          studentId: studentId !== undefined ? studentId : existing[0].studentId,
          departmentId: departmentId !== undefined ? departmentId : existing[0].departmentId,
          year: year !== undefined ? year : existing[0].year,
          phone: phone !== undefined ? phone : existing[0].phone,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : existing[0].avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, uid))
        .returning();
      return res.json(updated[0]);
    }

    const inserted = await db
      .insert(users)
      .values({
        uid,
        email,
        fullName: fullName || 'Campus User',
        role: role || (uid.includes('admin') ? 'admin' : 'student'),
        studentId: studentId || null,
        departmentId: departmentId ? Number(departmentId) : null,
        year: year || null,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user profile' });
  }
});

// Student registration
router.post('/auth/register', async (req, res) => {
  try {
    const {
      fullName,
      studentId,
      email,
      departmentId,
      year,
      phone,
      password,
    } = req.body;

    if (!fullName || !studentId || !email || !departmentId || !year) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Generate a unique UID for standard registrations
    const generatedUid = `student-${studentId.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const checkExisting = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.studentId, studentId)))
      .limit(1);

    if (checkExisting.length > 0) {
      return res.status(400).json({ error: 'A student with this Email or Student ID already exists' });
    }

    const newUser = await db
      .insert(users)
      .values({
        uid: generatedUid,
        email,
        fullName,
        role: 'student',
        studentId,
        departmentId: Number(departmentId),
        year,
        phone: phone || null,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      })
      .returning();

    res.status(201).json({
      message: 'Student account created successfully',
      user: newUser[0],
      demoToken: newUser[0].uid,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register student' });
  }
});

// Demo accounts list for quick-switching in test & demo modes
router.get('/auth/demo-users', async (_req, res) => {
  try {
    const demoAccounts = await db
      .select({
        id: users.id,
        uid: users.uid,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        studentId: users.studentId,
        year: users.year,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .limit(10);
    res.json(demoAccounts);
  } catch (error) {
    console.error('Error fetching demo users:', error);
    res.status(500).json({ error: 'Failed to fetch demo users' });
  }
});

// ==========================================
// DEPARTMENTS & CATEGORIES
// ==========================================

// Get departments
router.get('/departments', async (_req, res) => {
  try {
    const depts = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.name));
    res.json(depts);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Create department (admin)
router.post('/departments', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });

    const newDept = await db
      .insert(departments)
      .values({
        name,
        description: description || null,
        isActive: true,
      })
      .returning();

    res.status(201).json(newDept[0]);
  } catch (error: any) {
    console.error('Error creating department:', error);
    if (error?.message?.includes('unique')) {
      return res.status(400).json({ error: 'A department with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department (admin)
router.patch('/departments/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deptId = Number(req.params.id);
    const { name, description, isActive } = req.body;

    const updated = await db
      .update(departments)
      .set({
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      })
      .where(eq(departments.id, deptId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Get categories
router.get('/categories', async (_req, res) => {
  try {
    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
    res.json(cats);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin)
router.post('/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const newCat = await db
      .insert(categories)
      .values({
        name,
        description: description || null,
        icon: icon || 'AlertCircle',
        isActive: true,
      })
      .returning();

    res.status(201).json(newCat[0]);
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error?.message?.includes('unique')) {
      return res.status(400).json({ error: 'A category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin)
router.patch('/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const catId = Number(req.params.id);
    const { name, description, icon, isActive } = req.body;

    const updated = await db
      .update(categories)
      .set({
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(icon ? { icon } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      })
      .where(eq(categories.id, catId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// ==========================================
// COMPLAINTS
// ==========================================

// Get complaints list
router.get('/complaints', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userUid = req.user!.uid;

    const {
      status,
      priority,
      categoryId,
      departmentId,
      search,
      sortBy = 'newest',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Conditions
    const conditions = [];

    // Security: Students can strictly ONLY see their own complaints
    if (userRole !== 'admin') {
      conditions.push(eq(complaints.studentId, userUid));
    }

    if (status && status !== 'all') {
      conditions.push(eq(complaints.status, status as string));
    }

    if (priority && priority !== 'all') {
      conditions.push(eq(complaints.priority, priority as string));
    }

    if (categoryId && categoryId !== 'all') {
      conditions.push(eq(complaints.categoryId, Number(categoryId)));
    }

    if (departmentId && departmentId !== 'all') {
      conditions.push(eq(complaints.departmentId, Number(departmentId)));
    }

    if (search && (search as string).trim() !== '') {
      const term = `%${(search as string).trim()}%`;
      conditions.push(
        or(
          like(complaints.complaintNumber, term),
          like(complaints.title, term),
          like(complaints.location, term),
          like(complaints.description, term)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Ordering
    let orderByClause = desc(complaints.createdAt);
    if (sortBy === 'oldest') {
      orderByClause = asc(complaints.createdAt);
    } else if (sortBy === 'updated') {
      orderByClause = desc(complaints.updatedAt);
    } else if (sortBy === 'priority') {
      // Custom priority order: Urgent, High, Medium, Low
      orderByClause = desc(
        sql`CASE 
          WHEN ${complaints.priority} = 'Urgent' THEN 4 
          WHEN ${complaints.priority} = 'High' THEN 3 
          WHEN ${complaints.priority} = 'Medium' THEN 2 
          ELSE 1 
        END`
      );
    }

    // Execute query with joins
    const items = await db
      .select({
        id: complaints.id,
        complaintNumber: complaints.complaintNumber,
        title: complaints.title,
        description: complaints.description,
        location: complaints.location,
        priority: complaints.priority,
        status: complaints.status,
        assignedTo: complaints.assignedTo,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        resolvedAt: complaints.resolvedAt,
        categoryId: complaints.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        departmentId: complaints.departmentId,
        departmentName: departments.name,
        studentId: complaints.studentId,
        studentName: users.fullName,
        studentRoll: users.studentId,
        studentEmail: users.email,
        studentAvatar: users.avatarUrl,
      })
      .from(complaints)
      .leftJoin(categories, eq(complaints.categoryId, categories.id))
      .leftJoin(departments, eq(complaints.departmentId, departments.id))
      .leftJoin(users, eq(complaints.studentId, users.uid))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limitNum)
      .offset(offset);

    // Get total count for pagination
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(whereClause);

    const total = Number(totalCountRes[0]?.count || 0);

    res.json({
      complaints: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Failed to retrieve complaints' });
  }
});

// Get complaint details by ID or complaint number
router.get('/complaints/:identifier', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { identifier } = req.params;
    const userRole = req.user!.role;
    const userUid = req.user!.uid;

    const isNumeric = /^\d+$/.test(identifier);
    const complaintCondition = isNumeric
      ? eq(complaints.id, Number(identifier))
      : eq(complaints.complaintNumber, identifier);

    const complaintRecords = await db
      .select({
        id: complaints.id,
        complaintNumber: complaints.complaintNumber,
        title: complaints.title,
        description: complaints.description,
        location: complaints.location,
        priority: complaints.priority,
        status: complaints.status,
        assignedTo: complaints.assignedTo,
        createdAt: complaints.createdAt,
        updatedAt: complaints.updatedAt,
        resolvedAt: complaints.resolvedAt,
        categoryId: complaints.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        departmentId: complaints.departmentId,
        departmentName: departments.name,
        studentId: complaints.studentId,
        studentName: users.fullName,
        studentRoll: users.studentId,
        studentEmail: users.email,
        studentPhone: users.phone,
        studentYear: users.year,
        studentAvatar: users.avatarUrl,
      })
      .from(complaints)
      .leftJoin(categories, eq(complaints.categoryId, categories.id))
      .leftJoin(departments, eq(complaints.departmentId, departments.id))
      .leftJoin(users, eq(complaints.studentId, users.uid))
      .where(complaintCondition)
      .limit(1);

    if (complaintRecords.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const complaint = complaintRecords[0];

    // Security check: Student can only view their own complaint
    if (userRole !== 'admin' && complaint.studentId !== userUid) {
      return res.status(403).json({ error: 'Unauthorized: You can only view your own complaints' });
    }

    // Fetch timeline updates
    const updates = await db
      .select()
      .from(complaintUpdates)
      .where(eq(complaintUpdates.complaintId, complaint.id))
      .orderBy(asc(complaintUpdates.createdAt));

    // Fetch attachments
    const attachmentList = await db
      .select()
      .from(attachments)
      .where(eq(attachments.complaintId, complaint.id))
      .orderBy(asc(attachments.createdAt));

    // Fetch internal notes (ADMIN ONLY)
    let notes: any[] = [];
    if (userRole === 'admin') {
      notes = await db
        .select()
        .from(internalNotes)
        .where(eq(internalNotes.complaintId, complaint.id))
        .orderBy(desc(internalNotes.createdAt));
    }

    res.json({
      ...complaint,
      updates,
      attachments: attachmentList,
      internalNotes: notes,
    });
  } catch (error) {
    console.error('Error fetching complaint details:', error);
    res.status(500).json({ error: 'Failed to fetch complaint details' });
  }
});

// Submit new complaint
router.post('/complaints', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      categoryId,
      departmentId,
      location,
      priority = 'Medium',
      attachmentData, // { fileName, fileUrl, fileType, fileSize }
    } = req.body;

    if (!title || !description || !categoryId || !location) {
      return res.status(400).json({ error: 'Title, description, category, and location are required' });
    }

    const studentUid = req.user!.uid;

    // Generate human-readable complaint number: CMP-2026-0000X
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(complaints);
    const nextSeq = Number(countResult[0]?.count || 0) + 1;
    const complaintNumber = `CMP-2026-${String(nextSeq).padStart(5, '0')}`;

    // Insert complaint
    const newComplaint = await db
      .insert(complaints)
      .values({
        complaintNumber,
        studentId: studentUid,
        title: title.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        departmentId: departmentId ? Number(departmentId) : null,
        location: location.trim(),
        priority: priority || 'Medium',
        status: 'Submitted',
      })
      .returning();

    const created = newComplaint[0];

    // Add initial timeline entry
    await db.insert(complaintUpdates).values({
      complaintId: created.id,
      userId: studentUid,
      userName: req.user!.fullName || 'Student',
      userRole: 'student',
      oldStatus: null,
      newStatus: 'Submitted',
      message: 'Complaint submitted with initial details and evidence.',
    });

    // If attachment provided
    if (attachmentData && attachmentData.fileUrl) {
      await db.insert(attachments).values({
        complaintId: created.id,
        fileName: attachmentData.fileName || 'evidence-file',
        fileUrl: attachmentData.fileUrl,
        fileType: attachmentData.fileType || 'image/jpeg',
        fileSize: attachmentData.fileSize ? Number(attachmentData.fileSize) : null,
      });
    }

    // Create notification for all admins
    const adminList = await db.select({ uid: users.uid }).from(users).where(eq(users.role, 'admin'));
    for (const admin of adminList) {
      await db.insert(notifications).values({
        userId: admin.uid,
        complaintId: created.id,
        title: priority === 'Urgent' ? 'Urgent Complaint Filed' : 'New Complaint Submitted',
        message: `${created.complaintNumber}: ${created.title} at ${created.location}`,
        type: priority === 'Urgent' ? 'urgent' : 'new_complaint',
      });
    }

    res.status(201).json(created);
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// Admin update complaint (Status, Priority, Department, Staff assignment)
router.patch('/complaints/:id/manage', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const {
      status,
      priority,
      departmentId,
      assignedTo,
      adminNote, // response / timeline message
    } = req.body;

    const currentRecords = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
    if (currentRecords.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const current = currentRecords[0];

    const isStatusChange = status && status !== current.status;
    const isResolved = status === 'Resolved';

    // Update complaint record
    const updated = await db
      .update(complaints)
      .set({
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(departmentId !== undefined ? { departmentId: departmentId ? Number(departmentId) : null } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(isResolved ? { resolvedAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId))
      .returning();

    // Add timeline update if status changed or message provided
    if (isStatusChange || adminNote) {
      const message = adminNote || `Status updated from ${current.status} to ${status}${assignedTo ? ` (Assigned to: ${assignedTo})` : ''}.`;
      await db.insert(complaintUpdates).values({
        complaintId,
        userId: req.user!.uid,
        userName: req.user!.fullName || 'Administration',
        userRole: 'admin',
        oldStatus: current.status,
        newStatus: status || current.status,
        message,
      });

      // Notify the student
      await db.insert(notifications).values({
        userId: current.studentId,
        complaintId,
        title: isResolved ? 'Complaint Resolved' : `Complaint Status: ${status || current.status}`,
        message: `${current.complaintNumber} update: ${message}`,
        type: isResolved ? 'resolved' : 'status_update',
      });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating complaint management:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Admin add official response
router.post('/complaints/:id/response', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Response message is required' });
    }

    const complaint = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
    if (complaint.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const current = complaint[0];

    const newUpdate = await db
      .insert(complaintUpdates)
      .values({
        complaintId,
        userId: req.user!.uid,
        userName: req.user!.fullName || 'Administration',
        userRole: 'admin',
        oldStatus: current.status,
        newStatus: current.status,
        message: message.trim(),
      })
      .returning();

    // Touch updatedAt
    await db.update(complaints).set({ updatedAt: new Date() }).where(eq(complaints.id, complaintId));

    // Notify student
    await db.insert(notifications).values({
      userId: current.studentId,
      complaintId,
      title: 'New Response from Administration',
      message: `Re: ${current.complaintNumber} - ${message.trim().slice(0, 100)}...`,
      type: 'admin_response',
    });

    res.status(201).json(newUpdate[0]);
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({ error: 'Failed to post response' });
  }
});

// Admin add internal note
router.post('/complaints/:id/internal-notes', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const { note } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Internal note is required' });
    }

    const newNote = await db
      .insert(internalNotes)
      .values({
        complaintId,
        authorId: req.user!.uid,
        authorName: req.user!.fullName || 'Admin Staff',
        note: note.trim(),
      })
      .returning();

    res.status(201).json(newNote[0]);
  } catch (error) {
    console.error('Error adding internal note:', error);
    res.status(500).json({ error: 'Failed to add internal note' });
  }
});

// Reject complaint (admin - requires reason)
router.post('/complaints/:id/reject', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'A rejection reason is strictly required' });
    }

    const complaint = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
    if (complaint.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const current = complaint[0];

    const updated = await db
      .update(complaints)
      .set({
        status: 'Rejected',
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId))
      .returning();

    await db.insert(complaintUpdates).values({
      complaintId,
      userId: req.user!.uid,
      userName: req.user!.fullName || 'Administration',
      userRole: 'admin',
      oldStatus: current.status,
      newStatus: 'Rejected',
      message: `Complaint was rejected. Reason: ${reason.trim()}`,
    });

    // Notify student
    await db.insert(notifications).values({
      userId: current.studentId,
      complaintId,
      title: 'Complaint Rejected',
      message: `${current.complaintNumber} was rejected: ${reason.trim()}`,
      type: 'rejected',
    });

    res.json(updated[0]);
  } catch (error) {
    console.error('Error rejecting complaint:', error);
    res.status(500).json({ error: 'Failed to reject complaint' });
  }
});

// Student or Admin reopen resolved complaint (requires reason)
router.post('/complaints/:id/reopen', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const { reason } = req.body;
    const userRole = req.user!.role;
    const userUid = req.user!.uid;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Please provide a reason explaining why the issue is not fixed' });
    }

    const complaint = await db.select().from(complaints).where(eq(complaints.id, complaintId)).limit(1);
    if (complaint.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const current = complaint[0];

    // Authorization: student can only reopen their own complaint
    if (userRole !== 'admin' && current.studentId !== userUid) {
      return res.status(403).json({ error: 'Unauthorized: You can only reopen your own complaints' });
    }

    if (current.status !== 'Resolved' && current.status !== 'Rejected') {
      return res.status(400).json({ error: 'Only resolved or rejected complaints can be reopened' });
    }

    const updated = await db
      .update(complaints)
      .set({
        status: 'Reopened',
        resolvedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, complaintId))
      .returning();

    // Timeline event
    await db.insert(complaintUpdates).values({
      complaintId,
      userId: userUid,
      userName: req.user!.fullName || 'Student',
      userRole: userRole,
      oldStatus: current.status,
      newStatus: 'Reopened',
      message: `Issue reopened: ${reason.trim()}`,
    });

    // Notify admins
    const admins = await db.select({ uid: users.uid }).from(users).where(eq(users.role, 'admin'));
    for (const admin of admins) {
      await db.insert(notifications).values({
        userId: admin.uid,
        complaintId,
        title: 'Complaint Reopened by Student',
        message: `${current.complaintNumber} reopened: "${reason.trim()}"`,
        type: 'reopened',
      });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error('Error reopening complaint:', error);
    res.status(500).json({ error: 'Failed to reopen complaint' });
  }
});

// ==========================================
// ANALYTICS (REAL DATABASE QUERIES)
// ==========================================
router.get('/analytics', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    // 1. Overall stats
    const totalComplaintsRes = await db.select({ count: sql<number>`count(*)` }).from(complaints);
    const total = Number(totalComplaintsRes[0]?.count || 0);

    const resolvedRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, 'Resolved'));
    const resolved = Number(resolvedRes[0]?.count || 0);

    const pendingRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, 'Submitted'));
    const newComplaints = Number(pendingRes[0]?.count || 0);

    const underReviewRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, 'Under Review'));
    const underReview = Number(underReviewRes[0]?.count || 0);

    const inProgressRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(eq(complaints.status, 'In Progress'));
    const inProgress = Number(inProgressRes[0]?.count || 0);

    const urgentRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(and(eq(complaints.priority, 'Urgent'), sql`${complaints.status} != 'Resolved'`));
    const urgent = Number(urgentRes[0]?.count || 0);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Average resolution time in hours
    const avgTimeRes = await db.execute(sql`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
      FROM complaints
      WHERE resolved_at IS NOT NULL
    `);
    const avgHours = Math.round(Number(avgTimeRes.rows[0]?.avg_hours || 48));

    // 2. Status breakdown
    const statusBreakdown = await db
      .select({
        status: complaints.status,
        count: sql<number>`count(*)`,
      })
      .from(complaints)
      .groupBy(complaints.status);

    // 3. Priority breakdown
    const priorityBreakdown = await db
      .select({
        priority: complaints.priority,
        count: sql<number>`count(*)`,
      })
      .from(complaints)
      .groupBy(complaints.priority);

    // 4. Category breakdown
    const categoryBreakdown = await db
      .select({
        categoryName: categories.name,
        count: sql<number>`count(*)`,
      })
      .from(complaints)
      .leftJoin(categories, eq(complaints.categoryId, categories.id))
      .groupBy(categories.name)
      .orderBy(desc(sql`count(*)`));

    // 5. Department comparison
    const departmentBreakdown = await db
      .select({
        departmentName: departments.name,
        total: sql<number>`count(*)`,
        resolved: sql<number>`count(case when ${complaints.status} = 'Resolved' then 1 end)`,
      })
      .from(complaints)
      .leftJoin(departments, eq(complaints.departmentId, departments.id))
      .where(sql`${departments.name} IS NOT NULL`)
      .groupBy(departments.name);

    // 6. Trend over time (grouped by day for past 14 days)
    const trendsRes = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon DD') as date,
        COUNT(*) as count
      FROM complaints
      WHERE created_at >= NOW() - INTERVAL '14 days'
      GROUP BY TO_CHAR(created_at, 'Mon DD'), DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `);

    res.json({
      metrics: {
        total,
        resolved,
        newComplaints,
        underReview,
        inProgress,
        urgent,
        resolutionRate,
        averageResolutionHours: avgHours,
      },
      statusBreakdown,
      priorityBreakdown,
      categoryBreakdown,
      departmentBreakdown,
      trends: trendsRes.rows,
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});

// ==========================================
// STUDENT MANAGEMENT (ADMIN)
// ==========================================
router.get('/students', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const studentList = await db
      .select({
        id: users.id,
        uid: users.uid,
        fullName: users.fullName,
        email: users.email,
        studentId: users.studentId,
        year: users.year,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        departmentName: departments.name,
        joinedAt: users.createdAt,
        complaintCount: sql<number>`(SELECT count(*) FROM complaints WHERE complaints.student_id = users.uid)`,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.role, 'student'))
      .orderBy(desc(users.createdAt));

    res.json(studentList);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch student list' });
  }
});

// ==========================================
// NOTIFICATIONS
// ==========================================
router.get('/notifications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userUid = req.user!.uid;
    const notifs = await db
      .select({
        id: notifications.id,
        complaintId: notifications.complaintId,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        type: notifications.type,
        createdAt: notifications.createdAt,
        complaintNumber: complaints.complaintNumber,
      })
      .from(notifications)
      .leftJoin(complaints, eq(notifications.complaintId, complaints.id))
      .where(eq(notifications.userId, userUid))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const unreadCountRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userUid), eq(notifications.isRead, false)));

    res.json({
      notifications: notifs,
      unreadCount: Number(unreadCountRes[0]?.count || 0),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Mark single notification read
router.patch('/notifications/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifId = Number(req.params.id);
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notifId), eq(notifications.userId, req.user!.uid)));
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications read
router.post('/notifications/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, req.user!.uid));
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
