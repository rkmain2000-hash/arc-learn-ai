import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "@/components/roadmap/CustomNode";
import AnimatedEdge from "@/components/roadmap/AnimatedEdge";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const RoadmapView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoadmap();
    }
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setRoadmap(data);
      
      // Convert stored nodes to ReactFlow format
      const nodesArray = Array.isArray(data.nodes) ? data.nodes : [];
      const flowNodes = nodesArray.map((node: any) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          label: node.label,
          type: node.type,
          level: node.level,
          description: node.description,
        },
      }));

      // Convert stored edges to ReactFlow format
      const edgesArray = Array.isArray(data.edges) ? data.edges : [];
      const flowEdges = edgesArray.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: 'animated',
        animated: edge.animated,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error("Failed to load roadmap");
      navigate("/roadmaps");
    }
  };

  const handleSave = async () => {
    try {
      // Convert ReactFlow nodes back to storage format
      const storageNodes = nodes.map(node => ({
        id: node.id,
        label: node.data.label,
        type: node.data.type,
        level: node.data.level,
        description: node.data.description,
        position: node.position,
      }));

      const storageEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
      }));

      const { error } = await supabase
        .from('roadmaps')
        .update({
          nodes: storageNodes,
          edges: storageEdges,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success("Roadmap saved!");
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving roadmap:', error);
      toast.error("Failed to save roadmap");
    }
  };

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    setHasChanges(true);
  }, [onNodesChange]);

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading roadmap...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/50 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/roadmaps")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{roadmap.title}</h1>
            <p className="text-sm text-muted-foreground">{roadmap.description}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          defaultEdgeOptions={{
            animated: true,
          }}
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data.type) {
                case 'core': return 'hsl(263 70% 60%)';
                case 'advanced': return 'hsl(195 100% 50%)';
                case 'bonus': return 'hsl(280 80% 65%)';
                default: return 'hsl(263 70% 60%)';
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default RoadmapView;