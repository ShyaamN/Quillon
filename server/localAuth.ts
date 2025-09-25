import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import type { Express } from "express";
import { storage } from "./storage";
import { loginSchema, signupSchema } from "@shared/schema";
import { z } from "zod";
import { getSession } from "./replitAuth";

const SALT_ROUNDS = 12;

export async function setupLocalAuth(app: Express) {
  // Set up session middleware if not already done by Replit auth
  if (!process.env.REPLIT_DOMAINS) {
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());
  }
  // Configure local strategy
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.passwordHash) {
          return done(null, false, { message: 'Please sign in with your original authentication method' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      // Validate request body
      const { email, password } = loginSchema.parse(req.body);

      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ message: 'Internal server error' });
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || 'Invalid credentials' });
        }

        req.logIn(user, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Login failed' });
          }
          return res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Signup route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      // Validate request body
      const { email, password, firstName, lastName } = signupSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Create user
      const user = await storage.createUserWithPassword({
        email,
        firstName,
        lastName,
        passwordHash
      });

      // Auto-login after signup
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Account created but login failed' });
        }
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Failed to create account' });
    }
  });

  // Check authentication status
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        }
      });
    } else {
      return res.json({ isAuthenticated: false });
    }
  });
}

// Middleware to check if user is authenticated (local or replit)
export const requireAuth = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required' });
};