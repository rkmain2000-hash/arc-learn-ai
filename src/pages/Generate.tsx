import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Generate = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to generate roadmaps");
        navigate("/auth");
        return;
      }

      toast.info("🤖 AI is crafting your learning path...");

      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-roadmap', {
        body: { topic }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (!functionData || !functionData.nodes) {
        throw new Error('Invalid roadmap data received');
      }

      console.log('Generated roadmap:', functionData);

      // Save to database
      const { data: savedRoadmap, error: saveError } = await supabase
        .from('roadmaps')
        .insert({
          user_id: user.id,
          title: functionData.title,
          description: description || functionData.description,
          topic,
          nodes: functionData.nodes,
          edges: functionData.edges
        })
        .select()
        .single();

      if (saveError) {
        console.error('Save error:', saveError);
        throw saveError;
      }

      toast.success("🎉 Roadmap generated successfully!");
      navigate(`/roadmap/${savedRoadmap.id}`);

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate roadmap");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Generate Learning Roadmap
              </CardTitle>
              <CardDescription className="text-base">
                Let AI create a personalized learning path for any topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="topic" className="text-sm font-medium">
                  Topic *
                </label>
                <Input
                  id="topic"
                  placeholder="e.g., Frontend Development, Machine Learning, DevOps"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="text-base"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Any specific areas you want to focus on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24 text-base"
                  disabled={isGenerating}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Roadmap
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                AI will create a comprehensive learning path with micro-topics and clear progression
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Generate;