import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import RackInstances, { buildRackLayout } from "./RackInstances";
import ClickZones from "./ClickZones";
import SelectedRackLabels from "./SelectedRackLabels";

export default function WarehouseScene({
  selectedRack,
  setSelectedRack,
  inventoryMap,
}) {
  const layout = useMemo(
    () => buildRackLayout(inventoryMap, selectedRack),
    [inventoryMap, selectedRack]
  );

  return (
    <Canvas
      camera={{
        position: [5, 95, 170],
        fov: 45,
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[30, 60, 40]} intensity={2} />

      <OrbitControls target={[0, 2, 160]} enableDamping />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 380]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <gridHelper
        args={[380, 160, "#475569", "#334155"]}
        position={[0, 0.02, 160]}
      />

      <RackInstances layout={layout} />

      <ClickZones
        bays={layout.bays}
        setSelectedRack={setSelectedRack}
      />

      <SelectedRackLabels
        selectedRack={selectedRack}
        layout={layout}
      />
    </Canvas>
  );
}