import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEssaySchema, insertExtracurricularSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Essay routes
  
  // GET /api/essays - Get all essays
  app.get('/api/essays', async (req, res) => {
    try {
      const essays = await storage.getEssays();
      res.json(essays);
    } catch (error) {
      console.error('Error fetching essays:', error);
      res.status(500).json({ error: 'Failed to fetch essays' });
    }
  });

  // GET /api/essays/:id - Get single essay
  app.get('/api/essays/:id', async (req, res) => {
    try {
      const essay = await storage.getEssay(req.params.id);
      if (!essay) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      res.json(essay);
    } catch (error) {
      console.error('Error fetching essay:', error);
      res.status(500).json({ error: 'Failed to fetch essay' });
    }
  });

  // POST /api/essays - Create new essay
  app.post('/api/essays', async (req, res) => {
    try {
      const validatedData = insertEssaySchema.parse(req.body);
      const essay = await storage.createEssay(validatedData);
      res.status(201).json(essay);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid essay data', details: error.errors });
      }
      console.error('Error creating essay:', error);
      res.status(500).json({ error: 'Failed to create essay' });
    }
  });

  // PUT /api/essays/:id - Update essay
  app.put('/api/essays/:id', async (req, res) => {
    try {
      const validatedData = insertEssaySchema.partial().parse(req.body);
      const essay = await storage.updateEssay(req.params.id, validatedData);
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

  // DELETE /api/essays/:id - Delete essay
  app.delete('/api/essays/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteEssay(req.params.id);
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
  
  // GET /api/extracurriculars - Get all activities
  app.get('/api/extracurriculars', async (req, res) => {
    try {
      const activities = await storage.getExtracurriculars();
      res.json(activities);
    } catch (error) {
      console.error('Error fetching extracurriculars:', error);
      res.status(500).json({ error: 'Failed to fetch extracurriculars' });
    }
  });

  // GET /api/extracurriculars/:id - Get single activity
  app.get('/api/extracurriculars/:id', async (req, res) => {
    try {
      const activity = await storage.getExtracurricular(req.params.id);
      if (!activity) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      res.json(activity);
    } catch (error) {
      console.error('Error fetching extracurricular:', error);
      res.status(500).json({ error: 'Failed to fetch extracurricular' });
    }
  });

  // POST /api/extracurriculars - Create new activity
  app.post('/api/extracurriculars', async (req, res) => {
    try {
      const validatedData = insertExtracurricularSchema.parse(req.body);
      const activity = await storage.createExtracurricular(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid extracurricular data', details: error.errors });
      }
      console.error('Error creating extracurricular:', error);
      res.status(500).json({ error: 'Failed to create extracurricular' });
    }
  });

  // PUT /api/extracurriculars/:id - Update activity
  app.put('/api/extracurriculars/:id', async (req, res) => {
    try {
      const validatedData = insertExtracurricularSchema.partial().parse(req.body);
      const activity = await storage.updateExtracurricular(req.params.id, validatedData);
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

  // DELETE /api/extracurriculars/:id - Delete activity
  app.delete('/api/extracurriculars/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteExtracurricular(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Extracurricular activity not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting extracurricular:', error);
      res.status(500).json({ error: 'Failed to delete extracurricular' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
