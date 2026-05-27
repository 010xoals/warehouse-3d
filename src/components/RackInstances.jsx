import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { blocks, levels, RACK } from "../data/layout";
import { getTotalQty } from "../utils/inventory";

function InstancedBox({ instances, size }) {
  const ref = useRef();
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    if (!ref.current) return;

    instances.forEach((item, i) => {
      matrix.makeTranslation(
        item.position[0],
        item.position[1],
        item.position[2]
      );

      ref.current.setMatrixAt(i, matrix);
      ref.current.setColorAt(i, color.set(item.color));
    });

    ref.current.instanceMatrix.needsUpdate = true;

    if (ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true;
    }
  }, [instances, matrix, color]);

  if (!instances.length) return null;

  return (
    <instancedMesh ref={ref} args={[null, null, instances.length]}>
      <boxGeometry args={size} />
      <meshStandardMaterial metalness={0.25} roughness={0.35} />
    </instancedMesh>
  );
}

export function buildRackLayout(inventoryMap, selectedRack) {
  const bays = [];
  const posts = [];
  const frontBackBeams = [];
  const sideBeams = [];
  const boundaries = [];
  const aisles = [];

  blocks.forEach((block, blockIndex) => {
    const baseZ = blockIndex * RACK.blockGap;
    const topZ = baseZ;
    const bottomZ = baseZ + RACK.pairGap;
    const aisleZ = baseZ + 5;

    const lines = [
      {
        name: block.top,
        start: block.topStart,
        end: block.topEnd,
        z: topZ,
        labelSide: "front",
      },
      {
        name: block.bottom,
        start: block.bottomStart,
        end: block.bottomEnd,
        z: bottomZ,
        labelSide: "back",
      },
    ];

    boundaries.push({
      position: [0, 0.03, topZ - 0.95],
      size: [45, 0.03, 0.05],
      color: "#facc15",
    });

    boundaries.push({
      position: [0, 0.03, bottomZ + 0.95],
      size: [45, 0.03, 0.05],
      color: "#facc15",
    });

    aisles.push({
      position: [0, 0.01, aisleZ],
      size: [50, 0.02, 5.5],
      color: "#111827",
    });

    lines.forEach((line) => {
      const nums =
        line.start <= line.end
          ? Array.from(
              { length: line.end - line.start + 1 },
              (_, i) => line.start + i
            )
          : Array.from(
              { length: line.start - line.end + 1 },
              (_, i) => line.start - i
            );

      nums.forEach((rackNo, i) => {
        const x = i * RACK.spacing + RACK.startX + (block.offsetX || 0);
        const rackId = `${line.name}-${String(rackNo).padStart(2, "0")}`;
        const isSelected = selectedRack === rackId;

        const rackLocs = levels.map((level) => `${rackId}-${level.no}`);

        const hasStock = rackLocs.some(
          (loc) => getTotalQty(inventoryMap[loc]) > 0
        );

        const postColor = isSelected ? "#38bdf8" : "#0b63ce";

        bays.push({
          rackId,
          x,
          z: line.z,
          labelSide: line.labelSide,
        });

        [-1, 1].forEach((sx) => {
          [-1, 1].forEach((sz) => {
            posts.push({
              position: [
                x + (sx * RACK.width) / 2,
                RACK.height / 2,
                line.z + (sz * RACK.depth) / 2,
              ],
              color: postColor,
            });
          });
        });

        levels.forEach((level) => {
          const loc = `${rackId}-${level.no}`;
          const qty = getTotalQty(inventoryMap[loc]);

          const beamColor = isSelected
            ? "#facc15"
            : qty > 0
            ? "#22c55e"
            : hasStock
            ? "#22c55e"
            : "#f97316";

          frontBackBeams.push({
            position: [x, level.y, line.z - RACK.depth / 2],
            color: beamColor,
          });

          frontBackBeams.push({
            position: [x, level.y, line.z + RACK.depth / 2],
            color: beamColor,
          });

          sideBeams.push({
            position: [x - RACK.width / 2, level.y, line.z],
            color: beamColor,
          });

          sideBeams.push({
            position: [x + RACK.width / 2, level.y, line.z],
            color: beamColor,
          });
        });
      });
    });
  });

  return {
    bays,
    posts,
    frontBackBeams,
    sideBeams,
    boundaries,
    aisles,
  };
}

function FloorBox({ position, size, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default function RackInstances({ layout }) {
  return (
    <>
      <InstancedBox
        instances={layout.posts}
        size={[0.08, RACK.height, 0.08]}
      />

      <InstancedBox
        instances={layout.frontBackBeams}
        size={[RACK.width + 0.15, 0.08, 0.1]}
      />

      <InstancedBox
        instances={layout.sideBeams}
        size={[0.08, 0.08, RACK.depth]}
      />

      {layout.boundaries.map((item, i) => (
        <FloorBox key={`boundary-${i}`} {...item} />
      ))}

      {layout.aisles.map((item, i) => (
        <FloorBox key={`aisle-${i}`} {...item} />
      ))}
    </>
  );
}