import { type User, type UpsertUser, type InsertUser, type Essay, type InsertEssay, type ExtracurricularActivity, type InsertExtracurricular } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  // Local auth methods
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(user: Omit<InsertUser, 'id'> & { passwordHash: string }): Promise<User>;
  // Legacy user methods
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Essay methods (user-scoped)
  getEssays(userId: string): Promise<Essay[]>;
  getEssay(id: string, userId: string): Promise<Essay | undefined>;
  createEssay(essay: InsertEssay, userId: string): Promise<Essay>;
  updateEssay(id: string, essay: Partial<InsertEssay>, userId: string): Promise<Essay | undefined>;
  deleteEssay(id: string, userId: string): Promise<boolean>;
  
  // Extracurricular activity methods (user-scoped)
  getExtracurriculars(userId: string): Promise<ExtracurricularActivity[]>;
  getExtracurricular(id: string, userId: string): Promise<ExtracurricularActivity | undefined>;
  createExtracurricular(activity: InsertExtracurricular, userId: string): Promise<ExtracurricularActivity>;
  updateExtracurricular(id: string, activity: Partial<InsertExtracurricular>, userId: string): Promise<ExtracurricularActivity | undefined>;
  deleteExtracurricular(id: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private essays: Map<string, Essay>;
  private extracurriculars: Map<string, ExtracurricularActivity>;

  constructor() {
    this.users = new Map();
    this.essays = new Map();
    this.extracurriculars = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id || '');
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(updatedUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const id = userData.id || randomUUID();
      const newUser: User = {
        id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        passwordHash: null, // Replit auth users don't have passwords
        authProvider: "replit",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(id, newUser);
      return newUser;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // This method is not used with Replit Auth
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Legacy method - using new user structure
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      passwordHash: null,
      authProvider: "legacy",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = Array.from(this.users.values());
    return users.find(user => user.email === email);
  }

  async createUserWithPassword(userData: Omit<InsertUser, 'id'> & { passwordHash: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      passwordHash: userData.passwordHash,
      authProvider: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Essay methods (user-scoped)
  async getEssays(userId: string): Promise<Essay[]> {
    return Array.from(this.essays.values()).filter(essay => essay.userId === userId);
  }

  async getEssay(id: string, userId: string): Promise<Essay | undefined> {
    const essay = this.essays.get(id);
    return essay && essay.userId === userId ? essay : undefined;
  }

  async createEssay(insertEssay: InsertEssay, userId: string): Promise<Essay> {
    const id = randomUUID();
    const essay: Essay = { 
      id,
      userId,
      title: insertEssay.title,
      content: insertEssay.content || "",
      collegeTarget: insertEssay.collegeTarget || "Common App",
      essayType: insertEssay.essayType || "Personal Statement", 
      wordCount: insertEssay.wordCount || 0,
      lastModified: new Date() 
    };
    this.essays.set(id, essay);
    return essay;
  }

  async updateEssay(id: string, updateData: Partial<InsertEssay>, userId: string): Promise<Essay | undefined> {
    const existing = this.essays.get(id);
    if (!existing || existing.userId !== userId) return undefined;
    
    const updated: Essay = { 
      ...existing,
      ...(updateData.title !== undefined && { title: updateData.title }),
      ...(updateData.content !== undefined && { content: updateData.content }),
      ...(updateData.collegeTarget !== undefined && { collegeTarget: updateData.collegeTarget }),
      ...(updateData.essayType !== undefined && { essayType: updateData.essayType }),
      ...(updateData.wordCount !== undefined && { wordCount: updateData.wordCount }),
      lastModified: new Date() 
    };
    this.essays.set(id, updated);
    return updated;
  }

  async deleteEssay(id: string, userId: string): Promise<boolean> {
    const existing = this.essays.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.essays.delete(id);
  }

  // Extracurricular methods (user-scoped)
  async getExtracurriculars(userId: string): Promise<ExtracurricularActivity[]> {
    return Array.from(this.extracurriculars.values()).filter(activity => activity.userId === userId);
  }

  async getExtracurricular(id: string, userId: string): Promise<ExtracurricularActivity | undefined> {
    const activity = this.extracurriculars.get(id);
    return activity && activity.userId === userId ? activity : undefined;
  }

  async createExtracurricular(insertActivity: InsertExtracurricular, userId: string): Promise<ExtracurricularActivity> {
    const id = randomUUID();
    const activity: ExtracurricularActivity = { 
      id,
      userId,
      activityName: insertActivity.activityName,
      description: insertActivity.description,
      role: insertActivity.role,
      duration: insertActivity.duration,
      impact: insertActivity.impact,
      lastModified: new Date() 
    };
    this.extracurriculars.set(id, activity);
    return activity;
  }

  async updateExtracurricular(id: string, updateData: Partial<InsertExtracurricular>, userId: string): Promise<ExtracurricularActivity | undefined> {
    const existing = this.extracurriculars.get(id);
    if (!existing || existing.userId !== userId) return undefined;
    
    const updated: ExtracurricularActivity = { 
      ...existing,
      ...(updateData.activityName !== undefined && { activityName: updateData.activityName }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.role !== undefined && { role: updateData.role }),
      ...(updateData.duration !== undefined && { duration: updateData.duration }),
      ...(updateData.impact !== undefined && { impact: updateData.impact }),
      lastModified: new Date() 
    };
    this.extracurriculars.set(id, updated);
    return updated;
  }

  async deleteExtracurricular(id: string, userId: string): Promise<boolean> {
    const existing = this.extracurriculars.get(id);
    if (!existing || existing.userId !== userId) return false;
    return this.extracurriculars.delete(id);
  }
}

export const storage = new MemStorage();
