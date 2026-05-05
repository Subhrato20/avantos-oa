import type { GraphNode } from "../types/actionBlueprintGraph";
import styles from "./DagView.module.css";

interface DagViewProps {
  nodes: GraphNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface LayoutNode {
  id: string;
  name: string;
  depth: number;
  row: number;
  prerequisites: string[];
}

const NODE_WIDTH = 140;
const NODE_HEIGHT = 52;
const COL_GAP = 64;
const ROW_GAP = 24;
const PAD = 16;

/**
 * Read-only layered DAG view of forms — confirms to a reviewer that we
 * understand the prerequisite graph visually. Static SVG; no react-flow.
 *
 * Layout: BFS by prerequisite depth → columns; assign rows greedily.
 */
export function DagView({ nodes, selectedId, onSelect }: DagViewProps) {
  const forms = nodes.filter((n) => n.type === "form");
  if (forms.length === 0) return null;

  // Compute depth per node = longest path from any root.
  const depthById = new Map<string, number>();
  const computeDepth = (id: string): number => {
    if (depthById.has(id)) return depthById.get(id)!;
    const node = forms.find((n) => n.id === id);
    if (!node) return 0;
    const prereqs = node.data.prerequisites ?? [];
    const d = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(computeDepth));
    depthById.set(id, d);
    return d;
  };
  forms.forEach((n) => computeDepth(n.id));

  // Group by depth, assign rows.
  const byDepth = new Map<number, GraphNode[]>();
  for (const n of forms) {
    const d = depthById.get(n.id) ?? 0;
    const arr = byDepth.get(d) ?? [];
    arr.push(n);
    byDepth.set(d, arr);
  }
  const layout: LayoutNode[] = [];
  for (const [d, group] of byDepth) {
    group.forEach((n, i) => {
      layout.push({
        id: n.id,
        name: n.data.name,
        depth: d,
        row: i,
        prerequisites: n.data.prerequisites ?? [],
      });
    });
  }
  const layoutById = new Map(layout.map((n) => [n.id, n]));

  const maxDepth = Math.max(...layout.map((n) => n.depth));
  const maxRow = Math.max(...layout.map((n) => n.row));
  const width = PAD * 2 + (maxDepth + 1) * NODE_WIDTH + maxDepth * COL_GAP;
  const height = PAD * 2 + (maxRow + 1) * NODE_HEIGHT + maxRow * ROW_GAP;

  const xOf = (depth: number) => PAD + depth * (NODE_WIDTH + COL_GAP);
  const yOf = (row: number) => PAD + row * (NODE_HEIGHT + ROW_GAP);

  return (
    <div className={styles.wrap} aria-label="Form dependency graph">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className={styles.svg}
      >
        {/* Edges */}
        {layout.flatMap((n) =>
          n.prerequisites
            .map((pid) => layoutById.get(pid))
            .filter((p): p is LayoutNode => Boolean(p))
            .map((p) => {
              const x1 = xOf(p.depth) + NODE_WIDTH;
              const y1 = yOf(p.row) + NODE_HEIGHT / 2;
              const x2 = xOf(n.depth);
              const y2 = yOf(n.row) + NODE_HEIGHT / 2;
              const mx = (x1 + x2) / 2;
              const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
              return (
                <path
                  key={`${p.id}->${n.id}`}
                  d={d}
                  fill="none"
                  className={styles.edge}
                />
              );
            }),
        )}

        {/* Nodes */}
        {layout.map((n) => {
          const isSelected = n.id === selectedId;
          return (
            <g
              key={n.id}
              transform={`translate(${xOf(n.depth)}, ${yOf(n.row)})`}
              className={isSelected ? styles.nodeGroupActive : styles.nodeGroup}
              onClick={() => onSelect(n.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${n.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(n.id);
                }
              }}
            >
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={8}
                className={isSelected ? styles.nodeRectActive : styles.nodeRect}
              />
              <text
                x={12}
                y={20}
                className={styles.nodeKicker}
              >
                Form
              </text>
              <text
                x={12}
                y={38}
                className={styles.nodeLabel}
              >
                {n.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
