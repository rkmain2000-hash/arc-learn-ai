import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Map, Zap, Target, ArrowRight, LogIn, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Advanced AI creates personalized learning paths tailored to your goals",
    },
    {
      icon: Target,
      title: "Clear Progression",
      description: "Visual roadmaps with micro-topics showing exactly what to learn next",
    },
    {
      icon: Zap,
      title: "Interactive Experience",
      description: "Drag and rearrange nodes, see animated connections as you explore",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
                ✨ AI-Powered Learning Paths
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Master Any Tech Skill
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                With AI Roadmaps
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate comprehensive, visual learning paths for any programming language, 
              framework, or tech career. AI creates personalized roadmaps with clear progression 
              from fundamentals to mastery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate("/generate")}
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Roadmap
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/roadmaps")}
                    className="text-lg px-8 py-6"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    My Roadmaps
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8 py-6"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Why Choose AI Roadmaps?
            </h2>
            <p className="text-xl text-muted-foreground">
              Intelligent learning paths designed for your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all h-full hover:shadow-lg hover:shadow-primary/10">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
              <CardContent className="pt-12 pb-12 text-center">
                <Map className="h-16 w-16 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Start Learning?
                </h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Create your first AI-powered roadmap in seconds. 
                  No credit card required.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate(user ? "/generate" : "/auth")}
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {user ? "Generate Your Roadmap" : "Get Started Free"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
