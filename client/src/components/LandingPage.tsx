import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModal } from "@/components/AuthModal";
import { 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  GraduationCap
} from "lucide-react";

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Essay Writing Assistant",
      description: "Get AI-powered feedback and suggestions to improve your college essays"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Smart Insights",
      description: "Analyze your writing style and get personalized recommendations"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Goal Tracking",
      description: "Track your application progress across multiple colleges"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Extracurricular Management",
      description: "Organize and optimize your activities for maximum impact"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      school: "Stanford University",
      text: "Quillon helped me craft compelling essays that got me into my dream school!"
    },
    {
      name: "Marcus Rodriguez",
      school: "Harvard University", 
      text: "The AI feedback was incredibly helpful in improving my writing style."
    },
    {
      name: "Emma Thompson",
      school: "MIT",
      text: "Managing my applications became so much easier with Quillon's dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="w-full py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="mb-8">
            <GraduationCap className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground sm:text-6xl">
              Your AI-Powered
              <span className="text-primary block">College Application Assistant</span>
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground mb-8">
            Transform your college application process with intelligent essay feedback, 
            smart insights, and comprehensive application management. Get into your dream school with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowAuthModal(true)}
              className="text-lg px-8 py-3"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowAuthModal(true)}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools designed to help you create outstanding college applications
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Why students choose Quillon
            </h2>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">AI-Powered Essay Feedback</h3>
                    <p className="text-muted-foreground">Get instant, detailed feedback on your essays with suggestions for improvement</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Smart Application Tracking</h3>
                    <p className="text-muted-foreground">Keep track of deadlines, requirements, and progress across all your applications</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Extracurricular Optimization</h3>
                    <p className="text-muted-foreground">Showcase your activities in the most compelling way possible</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Personalized Insights</h3>
                    <p className="text-muted-foreground">Get tailored recommendations based on your unique profile and goals</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:pl-8">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg font-medium mb-4">
                    "Quillon made my college application process so much smoother. The AI feedback helped me write essays I never thought I could!"
                  </blockquote>
                  <cite className="text-sm text-muted-foreground">
                    — Alex Johnson, accepted to UC Berkeley
                  </cite>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 bg-muted/30">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students who got into their dream schools
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="pt-6">
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm mb-4">"{testimonial.text}"</blockquote>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.school}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who are already using Quillon to improve their college applications
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowAuthModal(true)}
            className="text-lg px-8 py-3"
          >
            Start Your Journey Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}