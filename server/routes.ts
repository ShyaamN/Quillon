import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEssaySchema, insertExtracurricularSchema } from "@shared/schema";
import { analyzeEssayFeedback, generateChatResponse, suggestEssayEdit, refineExtracurricularActivity } from "./gemini";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth, requireAuth } from "./localAuth";
import { z } from "zod";
import bcrypt from "bcrypt";

// Function to create a test user for development
async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await storage.getUserByEmail('test@example.com');
    if (existingUser) {
      console.log('✅ Test user already exists: test@example.com / password');
      return;
    }

    // Create test user
    const passwordHash = await bcrypt.hash('password', 12);
    await storage.createUserWithPassword({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash
    });
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔐 Password: password');
  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (both Replit and local)
  await setupAuth(app);
  await setupLocalAuth(app);

  // Create a test user for development (only if no users exist)
  if (process.env.NODE_ENV === 'development') {
    await createTestUser();
  }

  // Enhanced auth user route that works with both auth methods
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      let userId: string;
      let user: any;

      // Check if this is a Replit auth user (has claims)
      if (req.user && req.user.claims) {
        userId = getUserId(req);
        user = await storage.getUser(userId);
      } 
      // Otherwise it's a local auth user
      else if (req.user && req.user.id) {
        user = req.user;
      } else {
        return res.status(401).json({ message: "Invalid authentication" });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout route
  app.get('/api/logout', (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      
      // Destroy the session
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Failed to destroy session" });
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Helper function to get user ID from either auth method
  const getUserId = (req: any): string => {
    if (req.user?.claims?.sub) {
      return req.user.claims.sub; // Replit auth user id
    }

    if (req.user?.id) {
      return req.user.id; // Local auth user id
    }

    throw new Error("No valid user authentication");
  };

  // Essay routes
  
  // GET /api/essays - Get all essays (user-scoped)
  app.get('/api/essays', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const essays = await storage.getEssays(userId);
      res.json(essays);
    } catch (error) {
      console.error('Error fetching essays:', error);
      res.status(500).json({ error: 'Failed to fetch essays' });
    }
  });

  // GET /api/essays/:id - Get single essay (user-scoped)
  app.get('/api/essays/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const essay = await storage.getEssay(req.params.id, userId);
      if (!essay) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      res.json(essay);
    } catch (error) {
      console.error('Error fetching essay:', error);
      res.status(500).json({ error: 'Failed to fetch essay' });
    }
  });

  // POST /api/essays - Create new essay (user-scoped)
  app.post('/api/essays', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertEssaySchema.parse(req.body);
      const essay = await storage.createEssay(validatedData, userId);
      res.status(201).json(essay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid essay data', details: error.errors });
      }
      console.error('Error creating essay:', error);
      res.status(500).json({ error: 'Failed to create essay' });
    }
  });

  // PUT /api/essays/:id - Update essay (user-scoped)
  app.put('/api/essays/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertEssaySchema.partial().parse(req.body);
      const essay = await storage.updateEssay(req.params.id, validatedData, userId);
      if (!essay) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      res.json(essay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid essay data', details: error.errors });
      }
      console.error('Error updating essay:', error);
      res.status(500).json({ error: 'Failed to update essay' });
    }
  });

  // DELETE /api/essays/:id - Delete essay (user-scoped)
  app.delete('/api/essays/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const deleted = await storage.deleteEssay(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting essay:', error);
      res.status(500).json({ error: 'Failed to delete essay' });
    }
  });

  // Extracurricular routes
  
  // GET /api/extracurriculars - Get all activities (user-scoped)
  app.get('/api/extracurriculars', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const activities = await storage.getExtracurriculars(userId);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching extracurriculars:', error);
      res.status(500).json({ error: 'Failed to fetch extracurriculars' });
    }
  });

  // GET /api/extracurriculars/:id - Get single activity (user-scoped)
  app.get('/api/extracurriculars/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const activity = await storage.getExtracurricular(req.params.id, userId);
      if (!activity) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      res.json(activity);
    } catch (error) {
      console.error('Error fetching extracurricular:', error);
      res.status(500).json({ error: 'Failed to fetch extracurricular' });
    }
  });

  // POST /api/extracurriculars - Create new activity (user-scoped)
  app.post('/api/extracurriculars', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertExtracurricularSchema.parse(req.body);
      const activity = await storage.createExtracurricular(validatedData, userId);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid extracurricular data', details: error.errors });
      }
      console.error('Error creating extracurricular:', error);
      res.status(500).json({ error: 'Failed to create extracurricular' });
    }
  });

  // PUT /api/extracurriculars/:id - Update activity (user-scoped)
  app.put('/api/extracurriculars/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const validatedData = insertExtracurricularSchema.partial().parse(req.body);
      const activity = await storage.updateExtracurricular(req.params.id, validatedData, userId);
      if (!activity) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      res.json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid extracurricular data', details: error.errors });
      }
      console.error('Error updating extracurricular:', error);
      res.status(500).json({ error: 'Failed to update extracurricular' });
    }
  });

  // DELETE /api/extracurriculars/:id - Delete activity (user-scoped)
  app.delete('/api/extracurriculars/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const deleted = await storage.deleteExtracurricular(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting extracurricular:', error);
      res.status(500).json({ error: 'Failed to delete extracurricular' });
    }
  });

  // AI routes
  
  // POST /api/essays/:id/feedback - Analyze essay and provide feedback (user-scoped)
  app.post('/api/essays/:id/feedback', requireAuth, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      
      const userId = getUserId(req);
      const essay = await storage.getEssay(req.params.id, userId);
      if (!essay) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      
      // Remove HTML tags and sanitize content for analysis
      const plainTextContent = essay.content.replace(/<[^>]*>/g, '').trim();
      if (!plainTextContent) {
        return res.status(400).json({ error: 'Essay content is empty' });
      }
      
      const feedback = await analyzeEssayFeedback(plainTextContent);
      res.json(feedback);
    } catch (error) {
      console.error('Error analyzing essay:', error);
      if (error instanceof Error && error.message.includes('not configured')) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      res.status(500).json({ error: 'Failed to analyze essay' });
    }
  });

  // POST /api/chat - AI chat responses (user-scoped)
  app.post('/api/chat', requireAuth, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      
      const userId = getUserId(req);
      const chatSchema = z.object({
        message: z.string().min(1).max(1000),
        essayId: z.string().optional()
      });
      
      const { message, essayId } = chatSchema.parse(req.body);
      
      let essayContext = '';
      if (essayId) {
        const essay = await storage.getEssay(essayId, userId);
        if (essay) {
          essayContext = essay.content.replace(/<[^>]*>/g, '').trim();
        }
      }
      
      const response = await generateChatResponse(message, essayContext);
      res.json({ response });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid chat data', details: error.errors });
      }
      console.error('Error generating chat response:', error);
      if (error instanceof Error && error.message.includes('not configured')) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      res.status(500).json({ error: 'Failed to generate chat response' });
    }
  });

  // POST /api/essays/:id/suggest-edit - Generate AI edit suggestions (user-scoped)
  app.post('/api/essays/:id/suggest-edit', requireAuth, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      
      const userId = getUserId(req);
      const essay = await storage.getEssay(req.params.id, userId);
      if (!essay) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      
      const editSchema = z.object({
        request: z.string().min(1).max(500)
      });
      
      const { request } = editSchema.parse(req.body);
      
      const plainTextContent = essay.content.replace(/<[^>]*>/g, '').trim();
      if (!plainTextContent) {
        return res.status(400).json({ error: 'Essay content is empty' });
      }
      
      const suggestion = await suggestEssayEdit(plainTextContent, request);
      res.json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid edit request', details: error.errors });
      }
      console.error('Error generating edit suggestion:', error);
      if (error instanceof Error && error.message.includes('not configured')) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      res.status(500).json({ error: 'Failed to generate edit suggestion' });
    }
  });

  // POST /api/extracurriculars/:id/refine - AI-powered refinement suggestions for activities (user-scoped)
  app.post('/api/extracurriculars/:id/refine', requireAuth, async (req: any, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      
      const userId = getUserId(req);
      const activity = await storage.getExtracurricular(req.params.id, userId);
      if (!activity) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      
      // Validate that activity has required fields
      if (!activity.activityName?.trim() || !activity.description?.trim() || !activity.impact?.trim()) {
        return res.status(400).json({ error: 'Activity must have name, description, and impact to be refined' });
      }
      
      const refinement = await refineExtracurricularActivity({
        activityName: activity.activityName,
        description: activity.description,
        role: activity.role || '',
        duration: activity.duration || '',
        impact: activity.impact
      });
      
      res.json(refinement);
    } catch (error) {
      console.error('Error refining extracurricular activity:', error);
      if (error instanceof Error && error.message.includes('not configured')) {
        return res.status(503).json({ error: 'AI service is not configured' });
      }
      res.status(500).json({ error: 'Failed to refine extracurricular activity' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
