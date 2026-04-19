"use client";

import { useMemo, useState } from "react";
import StatusBadge from "@/components/status-badge";
import { getInitials } from "@/lib/format";
import { updateTaskStatus } from "@/lib/actions";
import type { TaskRow } from "@/types/models";

type FilterValue = "All" | "To Do" | "In Progress" | "Completed";

const isOverdue = (deadline?: string | null) => {
  if (!deadline) return false;
  const due = new Date(deadline);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
};

const isDueToday = (deadline?: string | null) => {
  if (!deadline) return false;
  const due = new Date(deadline);
  const today = new Date();
  return due.toDateString() === today.toDateString();
};

const isDueSoon = (deadline?: string | null) => {
  if (!deadline) return false;
  const due = new Date(deadline);
  const soon = new Date();
  soon.setDate(soon.getDate() + 3);
  return due <= soon && !isOverdue(deadline) && !isDueToday(deadline);
};

export default function TaskFilterList({
  tasks,
  projectId,
  usersMap = {},
}: {
  tasks: TaskRow[];
  projectId: string;
  usersMap?: Record<string, string>;
}) {
  const [filter, setFilter] = useState<FilterValue>("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const counts = {
    All: tasks.length,
    "To Do": tasks.filter(t => t.status === "To Do").length,
    "In Progress": tasks.filter(t => t.status === "In Progress").length,
    Completed: tasks.filter(t => t.status === "Completed").length,
  };

  const filtered = useMemo(() =>
    filter === "All" ? tasks : tasks.filter(t => t.status === filter),
  [filter, tasks]);

  const filterBtns: FilterValue[] = ["All", "To Do", "In Progress", "Completed"];

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: "0.25rem", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "0.25rem", marginBottom: "1rem" }}>
        {filterBtns.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              flex: 1,
              padding: "0.375rem 0.5rem",
              borderRadius: "calc(var(--radius) - 2px)",
              fontSize: "0.8125rem",
              fontWeight: filter === f ? 700 : 500,
              color: filter === f ? "var(--text)" : "var(--muted)",
              background: filter === f ? "var(--surface)" : "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: filter === f ? "var(--shadow-sm)" : "none",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            }}
          >
            {f}
            <span style={{
              fontSize: "0.7rem", fontWeight: 700,
              background: filter === f ? "var(--accent-soft)" : "var(--surface-3)",
              color: filter === f ? "var(--accent)" : "var(--muted)",
              borderRadius: 999, padding: "0 0.35rem", lineHeight: 1.6,
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)" }}>
          <p style={{ fontWeight: 600, color: "var(--text)" }}>No tasks</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.2rem" }}>No {filter !== "All" ? filter.toLowerCase() : ""} tasks found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {filtered.map(task => {
            const overdue = isOverdue(task.deadline);
            const dueToday = isDueToday(task.deadline);
            const dueSoon = isDueSoon(task.deadline);
            const assigneeName = task.assigned_to ? usersMap[task.assigned_to] : null;

            return (
              <div key={task.id} style={{
                background: "var(--surface-2)",
                border: `1px solid ${overdue ? "rgba(220,38,38,0.35)" : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "0.875rem 1rem",
                transition: "border-color 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{task.title}</p>
                      {overdue && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--danger-soft)", color: "var(--danger)", borderRadius: 999, padding: "0.1rem 0.5rem" }}>
                          Overdue
                        </span>
                      )}
                      {dueToday && !overdue && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--warning-soft)", color: "var(--warning)", borderRadius: 999, padding: "0.1rem 0.5rem" }}>
                          Due today
                        </span>
                      )}
                      {dueSoon && (
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "var(--info-soft)", color: "var(--info)", borderRadius: 999, padding: "0.1rem 0.5rem" }}>
                          Due soon
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "0.375rem" }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flexWrap: "wrap" }}>
                      {assigneeName && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--muted)" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "0.55rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {getInitials(assigneeName, null)}
                          </div>
                          {assigneeName}
                        </span>
                      )}
                      {task.deadline && (
                        <span style={{ fontSize: "0.75rem", color: overdue ? "var(--danger)" : "var(--muted)" }}>
                          📅 {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                {/* Status update form */}
                <form action={updateTaskStatus} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                  <input type="hidden" name="id" value={task.id} />
                  <input type="hidden" name="project_id" value={projectId} />
                  <select name="status" defaultValue={task.status} className="input" style={{ flex: 1, fontSize: "0.8rem", padding: "0.35rem 1.75rem 0.35rem 0.625rem" }}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                    Update
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
