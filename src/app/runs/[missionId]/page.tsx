"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSocket } from "@/providers/SocketProvider";
import { useMission, useMissionStatus, useMissionOutputs } from "@/lib/queries";
import { ResearchRunHeader } from "@/components/run/ResearchRunHeader";
import { ResearchProgressLog } from "@/components/run/ResearchProgressLog";
import { TaskStatusStrip } from "@/components/run/TaskStatusStrip";
import { MissionOutputsView } from "@/components/run/MissionOutputsView";
import type { ResearchProgressPayload } from "@/types/api";

interface PageProps {
  params: Promise<{ missionId: string }>;
}

const MAX_EVENTS = 500;

export default function RunPage({ params }: PageProps) {
  const { missionId } = use(params);
  const socket = useSocket();

  const { data: mission } = useMission(missionId);
  const isTerminal = mission?.status === "completed" || mission?.status === "failed";
  const { data: statusSummary } = useMissionStatus(missionId, !isTerminal);

  const [events, setEvents] = useState<ResearchProgressPayload[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>();
  const [currentSubagent, setCurrentSubagent] = useState<string | undefined>();
  const [taskStatuses, setTaskStatuses] = useState<Record<string, "pending" | "running" | "completed" | "failed">>({});
  const [showOutputs, setShowOutputs] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);

  // Elapsed timer
  useEffect(() => {
    if (isTerminal) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTerminal]);

  // Socket.IO: join mission room
  useEffect(() => {
    socket.emit("join_mission", { mission_id: missionId });

    const onProgress = (data: ResearchProgressPayload) => {
      if (data.mission_id !== missionId) return;
      setEvents((prev) => [...prev.slice(-(MAX_EVENTS - 1)), data]);

      const p = data.payload;
      if (p.task_id) {
        if (data.event_type === "task_started") {
          setCurrentTaskId(p.task_id);
          setTaskStatuses((prev) => ({ ...prev, [p.task_id!]: "running" }));
        } else if (data.event_type === "task_completed") {
          setTaskStatuses((prev) => ({ ...prev, [p.task_id!]: "completed" }));
          setCurrentTaskId(undefined);
        } else if (data.event_type === "task_failed") {
          setTaskStatuses((prev) => ({ ...prev, [p.task_id!]: "failed" }));
          setCurrentTaskId(undefined);
        }
      }
      if (p.subagent_name) {
        setCurrentSubagent(data.event_type === "agent_completed" ? undefined : p.subagent_name);
      }
    };

    socket.on("research_progress", onProgress);
    return () => {
      socket.off("research_progress", onProgress);
      socket.emit("leave_mission", { mission_id: missionId });
    };
  }, [socket, missionId]);

  // Initialize task statuses from mission task_defs
  useEffect(() => {
    if (!mission?.tasks) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      for (const task of mission.tasks) {
        if (!next[task.task_id]) next[task.task_id] = "pending";
      }
      return next;
    });
  }, [mission?.tasks]);

  // Sync task statuses from status summary
  useEffect(() => {
    if (!statusSummary) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      for (const id of statusSummary.completed_task_ids) next[id] = "completed";
      for (const id of statusSummary.failed_task_ids) next[id] = "failed";
      return next;
    });
  }, [statusSummary]);

  const taskIds = mission?.tasks.map((task) => task.task_id) ?? [];
  const taskNames = mission?.tasks.reduce(
    (acc, task) => ({ ...acc, [task.task_id]: task.title }),
    {} as Record<string, string>,
  );

  return (
    <div className="flex flex-col h-full">
      <ResearchRunHeader
        mission={mission}
        statusSummary={statusSummary}
        currentTaskId={currentTaskId}
        currentSubagent={currentSubagent}
        elapsedMs={!isTerminal ? elapsedMs : undefined}
      />

      <TaskStatusStrip
        taskIds={taskIds}
        taskNames={taskNames}
        statusByTaskId={taskStatuses}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        {isTerminal && !showOutputs && (
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Mission {mission?.status}.
            </span>
            <button
              onClick={() => setShowOutputs(true)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View full outputs
            </button>
            <Link
              href={`/dashboard/missions`}
              className="text-sm text-muted-foreground hover:text-foreground ml-auto"
            >
              Back to missions
            </Link>
          </div>
        )}

        {showOutputs ? (
          <div className="flex-1 overflow-y-auto">
            <MissionOutputsView missionId={missionId} />
          </div>
        ) : (
          <ResearchProgressLog events={events} />
        )}
      </div>
    </div>
  );
}
