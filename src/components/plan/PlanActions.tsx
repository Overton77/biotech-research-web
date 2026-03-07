"use client";

import { useState } from "react";
import { useSocket } from "@/providers/SocketProvider";

interface PlanActionsProps {
  threadId: string;
  interruptId: string;
  plan: Record<string, unknown>;
  onClose: () => void;
}

export function PlanActions({ threadId, interruptId, plan, onClose }: PlanActionsProps) {
  const socket = useSocket();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = () => {
    setLoading(true);
    socket.emit("plan_approved", {
      thread_id: threadId,
      interrupt_id: interruptId,
      plan,
    });
    onClose();
  };

  const handleReject = () => {
    setLoading(true);
    socket.emit("plan_rejected", {
      thread_id: threadId,
      interrupt_id: interruptId,
      notes,
    });
    onClose();
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <label className="block">
        <span className="text-xs text-gray-600 dark:text-gray-400">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Revision notes or rejection reason..."
          rows={2}
          className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={loading}
          className="flex-1 rounded-lg border border-red-300 bg-background px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
