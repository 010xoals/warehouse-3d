import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";

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
        position: [55, 90, 105],
        fov: 50,
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[30, 60, 40]} intensity={2} />

      <OrbitControls target={[52, 2, 50]} enableDamping />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 140]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <gridHelper
        args={[180, 120, "#475569", "#334155"]}
        position={[52, 0.02, 50]}
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
      {layout.floorLabels?.map((label, i) => (
      <Text
       key={`floor-label-${i}`}
       position={label.position}
       rotation={[-Math.PI / 2, 0, 0]}
       fontSize={label.type === "zone" ? 2.2 : 0.9}
       color={label.color}
       anchorX="center"
       anchorY="middle"
      >
     {label.text}
     </Text>
     ))}
    </Canvas>
  );
}