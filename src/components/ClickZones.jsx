import React from "react";
import { RACK } from "../data/layout";

export default function ClickZones({ bays, setSelectedRack }) {
  return (
    <>
      {bays.map((bay) => {
        const labelZ =
          bay.labelSide === "front"
            ? bay.z - RACK.depth / 2 - 0.16
            : bay.z + RACK.depth / 2 + 0.16;

        const rotationY = bay.labelSide === "front" ? Math.PI : 0;

        return (
          <mesh
            key={bay.rackId}
            position={[bay.x, 3.1, labelZ]}
            rotation={[0, rotationY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRack(bay.rackId);
            }}
          >
            <planeGeometry args={[1.1, 6.2]} />
            <meshBasicMaterial transparent opacity={0} side={2} />
          </mesh>
        );
      })}
    </>
  );
}