import { type User, type InsertUser, type Essay, type InsertEssay, type ExtracurricularActivity, type InsertExtracurricular } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Essay methods
  getEssays(): Promise<Essay[]>;
  getEssay(id: string): Promise<Essay | undefined>;
  createEssay(essay: InsertEssay): Promise<Essay>;
  updateEssay(id: string, essay: Partial<InsertEssay>): Promise<Essay | undefined>;
  deleteEssay(id: string): Promise<boolean>;
  
  // Extracurricular activity methods
  getExtracurriculars(): Promise<ExtracurricularActivity[]>;
  getExtracurricular(id: string): Promise<ExtracurricularActivity | undefined>;
  createExtracurricular(activity: InsertExtracurricular): Promise<ExtracurricularActivity>;
  updateExtracurricular(id: string, activity: Partial<InsertExtracurricular>): Promise<ExtracurricularActivity | undefined>;
  deleteExtracurricular(id: string): Promise<boolean>;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Essay methods
  async getEssays(): Promise<Essay[]> {
    return Array.from(this.essays.values());
  }

  async getEssay(id: string): Promise<Essay | undefined> {
    return this.essays.get(id);
  }

  async createEssay(insertEssay: InsertEssay): Promise<Essay> {
    const id = randomUUID();
    const essay: Essay = { 
      id, 
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

  async updateEssay(id: string, updateData: Partial<InsertEssay>): Promise<Essay | undefined> {
    const existing = this.essays.get(id);
    if (!existing) return undefined;
    
    const updated: Essay = { 
      ...existing,
      ...(updateData.title && { title: updateData.title }),
      ...(updateData.content !== undefined && { content: updateData.content }),
      ...(updateData.collegeTarget !== undefined && { collegeTarget: updateData.collegeTarget }),
      ...(updateData.essayType && { essayType: updateData.essayType }),
      ...(updateData.wordCount !== undefined && { wordCount: updateData.wordCount }),
      lastModified: new Date() 
    };
    this.essays.set(id, updated);
    return updated;
  }

  async deleteEssay(id: string): Promise<boolean> {
    return this.essays.delete(id);
  }

  // Extracurricular methods
  async getExtracurriculars(): Promise<ExtracurricularActivity[]> {
    return Array.from(this.extracurriculars.values());
  }

  async getExtracurricular(id: string): Promise<ExtracurricularActivity | undefined> {
    return this.extracurriculars.get(id);
  }

  async createExtracurricular(insertActivity: InsertExtracurricular): Promise<ExtracurricularActivity> {
    const id = randomUUID();
    const activity: ExtracurricularActivity = { 
      id,
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

  async updateExtracurricular(id: string, updateData: Partial<InsertExtracurricular>): Promise<ExtracurricularActivity | undefined> {
    const existing = this.extracurriculars.get(id);
    if (!existing) return undefined;
    
    const updated: ExtracurricularActivity = { 
      ...existing,
      ...(updateData.activityName && { activityName: updateData.activityName }),
      ...(updateData.description && { description: updateData.description }),
      ...(updateData.role && { role: updateData.role }),
      ...(updateData.duration && { duration: updateData.duration }),
      ...(updateData.impact && { impact: updateData.impact }),
      lastModified: new Date() 
    };
    this.extracurriculars.set(id, updated);
    return updated;
  }

  async deleteExtracurricular(id: string): Promise<boolean> {
    return this.extracurriculars.delete(id);
  }
}

export const storage = new MemStorage();
