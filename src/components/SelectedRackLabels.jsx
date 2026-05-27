import React from "react";
import { Text } from "@react-three/drei";
import { levels, RACK } from "../data/layout";

export default function SelectedRackLabels({
  selectedRack,
  layout,
}) {
  const bay = layout.bays.find(
    (b) => b.rackId === selectedRack
  );

  if (!bay) return null;

  const labelZ =
    bay.labelSide === "front"
      ? bay.z - RACK.depth / 2 - 0.16
      : bay.z + RACK.depth / 2 + 0.16;

  const rotationY =
    bay.labelSide === "front"
      ? Math.PI
      : 0;

  return (
    <>
      {/* 선택된 렉 이름 */}
      <Text
        position={[bay.x, 6.55, labelZ]}
        rotation={[0, rotationY, 0]}
        fontSize={0.18}
        color="#facc15"
        anchorX="center"
        anchorY="middle"
      >
        {selectedRack}
      </Text>

      {/* 선택된 렉 LOC만 표시 */}
      {levels.map((level) => (
        <Text
          key={level.no}
          position={[
            bay.x,
            level.y + 0.2,
            labelZ,
          ]}
          rotation={[0, rotationY, 0]}
          fontSize={0.13}
          color="#facc15"
          anchorX="center"
          anchorY="middle"
        >
          {`${selectedRack}-${level.no}`}
        </Text>
      ))}
    </>
  );
}