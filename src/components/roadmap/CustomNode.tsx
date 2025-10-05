import { Handle, Position, NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CustomNode = ({ data }: NodeProps) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'core':
        return 'border-[hsl(var(--node-core))] bg-[hsl(var(--node-core))]/10';
      case 'advanced':
        return 'border-[hsl(var(--node-advanced))] bg-[hsl(var(--node-advanced))]/10';
      case 'bonus':
        return 'border-[hsl(var(--node-bonus))] bg-[hsl(var(--node-bonus))]/10';
      default:
        return 'border-primary bg-primary/10';
    }
  };

  const getLevelBadge = () => {
    const badges = ['Beginner', 'Foundation', 'Intermediate', 'Advanced', 'Expert'];
    const level = Number(data.level) || 1;
    return badges[level - 1] || 'Level ' + level;
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[250px] backdrop-blur",
        getNodeStyle()
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-1 rounded bg-background/50">
            {getLevelBadge()}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{String(data.type)}</span>
        </div>
        
        <h3 className="font-semibold text-sm leading-tight">{String(data.label)}</h3>
        
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {String(data.description)}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </motion.div>
  );
};

export default CustomNode;