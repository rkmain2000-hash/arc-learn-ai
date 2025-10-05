import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Map, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Roadmap {
  id: string;
  title: string;
  description: string;
  topic: string;
  created_at: string;
  nodes: any;
  edges?: any;
}

const Roadmaps = () => {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRoadmaps((data as any) || []);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error("Failed to load roadmaps");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Roadmap deleted");
      fetchRoadmaps();
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error("Failed to delete roadmap");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Map className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Roadmaps</h1>
          <p className="text-muted-foreground">
            View and manage your generated learning paths
          </p>
        </div>

        {roadmaps.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Map className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No roadmaps yet</h3>
              <p className="text-muted-foreground mb-6">
                Generate your first AI-powered learning path
              </p>
              <Button onClick={() => navigate("/generate")}>
                Create Roadmap
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((roadmap, index) => (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5 text-primary" />
                      {roadmap.title}
                    </CardTitle>
                    <CardDescription>
                      {roadmap.description || roadmap.topic}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{Array.isArray(roadmap.nodes) ? roadmap.nodes.length : 0} topics</span>
                      <span>
                        {new Date(roadmap.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                        className="flex-1"
                        variant="default"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDelete(roadmap.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;