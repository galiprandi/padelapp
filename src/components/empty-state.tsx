import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { type LucideIcon, Cpu, AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-8 rounded-xl border border-white/10 bg-zinc-950/40 px-8 py-16 text-center backdrop-blur-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700",
        className,
      )}
    >
      {/* Decorative HUD Elements */}
      <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-white/20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-white/20" />

      {Icon ? (
        <div className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
          <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
          <div className="absolute -top-1 -right-1">
            <div className="h-4 w-4 rounded-full bg-accent flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-2 w-2 text-accent-foreground" />
            </div>
          </div>
        </div>
      ) : (
        <Cpu className="h-12 w-12 text-white/20 animate-pulse" />
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2 opacity-40">
          <div className="h-[1px] w-8 bg-white" />
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white">Data_Null</p>
          <div className="h-[1px] w-8 bg-white" />
        </div>
        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">
          {title}
        </h3>
        <p className="text-[10px] font-mono leading-relaxed text-white/40 max-w-[280px] mx-auto uppercase tracking-wider">
          {description}
        </p>
      </div>

      {action ? (
        <div className="pt-4 w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          {action}
        </div>
      ) : null}
    </div>
  );
}
