import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import * as XLSX from "xlsx";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import "./index.css";

const blocks = [
  { top: "J01", topStart: 35, topEnd: 68, bottom: "J02", bottomStart: 1, bottomEnd: 34 },
  { top: "J02", topStart: 68, topEnd: 35, bottom: "J03", bottomStart: 1, bottomEnd: 34 },
  { top: "J03", topStart: 68, topEnd: 35, bottom: "J04", bottomStart: 1, bottomEnd: 34 },
  { top: "J04", topStart: 68, topEnd: 35, bottom: "J05", bottomStart: 1, bottomEnd: 34 },
  { top: "J05", topStart: 68, topEnd: 35, bottom: "J06", bottomStart: 1, bottomEnd: 34 },
  { top: "J06", topStart: 68, topEnd: 35, bottom: "J07", bottomStart: 1, bottomEnd: 34 },
  { top: "J07", topStart: 68, topEnd: 35, bottom: "J08", bottomStart: 1, bottomEnd: 34 },
  { top: "J08", topStart: 68, topEnd: 35, bottom: "J09", bottomStart: 1, bottomEnd: 34 },
  { top: "J09", topStart: 68, topEnd: 35, bottom: "J10", bottomStart: 1, bottomEnd: 34 },
  { top: "J10", topStart: 68, topEnd: 35, bottom: "J11", bottomStart: 1, bottomEnd: 34 },
  { top: "J11", topStart: 68, topEnd: 35, bottom: "J12", bottomStart: 1, bottomEnd: 34 },
  { top: "J12", topStart: 68, topEnd: 35, bottom: "J13", bottomStart: 1, bottomEnd: 34 },
];

const levels = [
  { no: "01", y: 0.55 },
  { no: "02", y: 1.55 },
  { no: "03", y: 2.55 },
  { no: "04", y: 3.55 },
  { no: "05", y: 4.55 },
  { no: "06", y: 5.55 },
];

const inventoryCol = collection(db, "jzone_inventory");
const metaRef = doc(db, "jzone_meta", "latest");

const getTotalQty = (data) => Number(data?.TOTAL_QTY || 0);

function Part({ position, size, color }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.25} roughness={0.35} />
    </mesh>
  );
}

function RackBay({ x, z, name, rackNo, selectedRack, setSelectedRack, labelSide, inventoryMap }) {
  const rackId = `${name}-${String(rackNo).padStart(2, "0")}`;
  const isSelected = selectedRack === rackId;

  const width = 1.05;
  const depth = 1.2;
  const height = 6;

  const rackLocs = levels.map((level) => `${rackId}-${level.no}`);
  const hasStock = rackLocs.some((loc) => getTotalQty(inventoryMap[loc]) > 0);

  const blue = isSelected ? "#38bdf8" : "#0b63ce";
  const orange = isSelected ? "#facc15" : hasStock ? "#22c55e" : "#f97316";

  const labelZ = labelSide === "front" ? -depth / 2 - 0.16 : depth / 2 + 0.16;
  const labelRotationY = labelSide === "front" ? Math.PI : 0;

  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <Part key={`${sx}-${sz}`} position={[sx * width / 2, height / 2, sz * depth / 2]} size={[0.08, height, 0.08]} color={blue} />
        ))
      )}

      {levels.map((level) => {
        const loc = `${rackId}-${level.no}`;
        const qty = getTotalQty(inventoryMap[loc]);
        const levelColor = isSelected ? "#facc15" : qty > 0 ? "#22c55e" : orange;

        return (
          <group key={level.no}>
            <Part position={[0, level.y, -depth / 2]} size={[width + 0.15, 0.08, 0.1]} color={levelColor} />
            <Part position={[0, level.y, depth / 2]} size={[width + 0.15, 0.08, 0.1]} color={levelColor} />
            <Part position={[-width / 2, level.y, 0]} size={[0.08, 0.08, depth]} color={levelColor} />
            <Part position={[width / 2, level.y, 0]} size={[0.08, 0.08, depth]} color={levelColor} />
          </group>
        );
      })}

      <mesh
        position={[0, 3.1, labelZ]}
        rotation={[0, labelRotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedRack(rackId);
        }}
      >
        <planeGeometry args={[1.1, 6.2]} />
        <meshBasicMaterial transparent opacity={0} side={2} />
      </mesh>

      <Text position={[0, 6.55, labelZ]} rotation={[0, labelRotationY, 0]} fontSize={0.14} color={isSelected ? "#facc15" : "#ffffff"} anchorX="center" anchorY="middle">
        {rackId}
      </Text>

      {isSelected &&
        levels.map((level) => {
          const loc = `${rackId}-${level.no}`;
          return (
            <Text key={loc} position={[0, level.y + 0.2, labelZ]} rotation={[0, labelRotationY, 0]} fontSize={0.12} color="#facc15" anchorX="center" anchorY="middle">
              {loc}
            </Text>
          );
        })}
    </group>
  );
}

function RackLine({ name, start, end, z, selectedRack, setSelectedRack, labelSide, inventoryMap }) {
  const nums =
    start <= end
      ? Array.from({ length: end - start + 1 }, (_, i) => start + i)
      : Array.from({ length: start - end + 1 }, (_, i) => start - i);

  return (
    <group>
      {nums.map((num, i) => (
        <RackBay
          key={`${name}-${num}`}
          x={i * 1.18 - 20}
          z={z}
          name={name}
          rackNo={num}
          selectedRack={selectedRack}
          setSelectedRack={setSelectedRack}
          labelSide={labelSide}
          inventoryMap={inventoryMap}
        />
      ))}

      <Text position={[-24, 0.08, z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.9} color="#ffffff">
        {name}
      </Text>
    </group>
  );
}

function RackBlock({ block, index, selectedRack, setSelectedRack, inventoryMap }) {
  const baseZ = index * 9;
  const topZ = baseZ;
  const bottomZ = baseZ + 1.55;
  const aisleZ = baseZ + 5;

  return (
    <group>
      <RackLine name={block.top} start={block.topStart} end={block.topEnd} z={topZ} selectedRack={selectedRack} setSelectedRack={setSelectedRack} labelSide="front" inventoryMap={inventoryMap} />
      <RackLine name={block.bottom} start={block.bottomStart} end={block.bottomEnd} z={bottomZ} selectedRack={selectedRack} setSelectedRack={setSelectedRack} labelSide="back" inventoryMap={inventoryMap} />

      <Part position={[0, 0.03, topZ - 0.95]} size={[45, 0.03, 0.05]} color="#facc15" />
      <Part position={[0, 0.03, bottomZ + 0.95]} size={[45, 0.03, 0.05]} color="#facc15" />
      <Part position={[0, 0.01, aisleZ]} size={[50, 0.02, 5.5]} color="#111827" />

      <Text position={[23, 0.08, aisleZ]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.55} color="#94a3b8">
        통로 5.5m
      </Text>
    </group>
  );
}

function Scene({ selectedRack, setSelectedRack, inventoryMap }) {
  return (
    <Canvas camera={{ position: [3, 42, 45], fov: 45 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[20, 35, 20]} intensity={2} />
      <OrbitControls target={[0, 2, 45]} enableDamping />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 120]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <gridHelper args={[120, 80, "#475569", "#334155"]} position={[0, 0.02, 50]} />

      {blocks.map((block, index) => (
        <RackBlock key={`${block.top}-${block.bottom}`} block={block} index={index} selectedRack={selectedRack} setSelectedRack={setSelectedRack} inventoryMap={inventoryMap} />
      ))}
    </Canvas>
  );
}

async function deleteOldInventory() {
  const snap = await getDocs(inventoryCol);
  const docs = snap.docs;

  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function saveInventoryToFirestore(map, fileName) {
  await deleteOldInventory();

  const entries = Object.entries(map);

  for (let i = 0; i < entries.length; i += 400) {
    const batch = writeBatch(db);

    entries.slice(i, i + 400).forEach(([loc, data]) => {
      const ref = doc(db, "jzone_inventory", loc);
      batch.set(ref, data);
    });

    await batch.commit();
  }

  await setDoc(metaRef, {
    fileName,
    updatedAt: new Date().toISOString(),
    count: entries.length,
  });
}

async function loadInventoryFromFirestore() {
  const snap = await getDocs(inventoryCol);
  const map = {};

  snap.forEach((d) => {
    map[d.id] = d.data();
  });

  const metaSnap = await getDoc(metaRef);
  const meta = metaSnap.exists() ? metaSnap.data() : {};

  return { map, meta };
}

export default function App() {
  const [selectedRack, setSelectedRack] = useState("J02-01");
  const [inventoryMap, setInventoryMap] = useState({});
  const [fileName, setFileName] = useState("");
  const [popupLoc, setPopupLoc] = useState(null);
  const [syncStatus, setSyncStatus] = useState("DB 불러오는 중...");

  useEffect(() => {
    const load = async () => {
      try {
        const { map, meta } = await loadInventoryFromFirestore();
        setInventoryMap(map);
        setFileName(meta.fileName || "");
        setSyncStatus(`DB 불러오기 완료 (${Object.keys(map).length} LOC)`);
      } catch (error) {
        console.error(error);
        setSyncStatus(error.message);
      }
    };

    load();
  }, []);

  const selectedLocs = levels.map((level) => {
    const loc = `${selectedRack}-${level.no}`;
    return { loc, data: inventoryMap[loc] || null };
  });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSyncStatus("엑셀 읽는 중...");

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const map = {};

    rows.forEach((row) => {
      const loc = String(row.LOC || row.loc || row.Location || row.location || "").trim();
      if (!loc) return;

      const sku = String(row.SKU || row.sku || row.SKU_CD || row.sku_cd || row.상품코드 || row.품번 || row.ITEM || row.item || "").trim();
      const itemName = String(row.ITEM_NAME || row.item_name || row.품목명 || row.상품명 || "").trim();
      const qty = Number(row.QTY ?? row.qty ?? row.수량 ?? 0);

      if (!map[loc]) {
        map[loc] = {
          LOC: loc,
          items: [],
          TOTAL_QTY: 0,
        };
      }

      const key = sku || itemName || "UNKNOWN";
      const existing = map[loc].items.find((item) => (item.SKU || item.ITEM_NAME) === key);

      if (existing) {
        existing.QTY += qty;
      } else {
        map[loc].items.push({
          SKU: sku,
          ITEM_NAME: itemName,
          QTY: qty,
        });
      }

      map[loc].TOTAL_QTY += qty;
    });

    setInventoryMap(map);
    setSyncStatus(`DB 저장 중... (${Object.keys(map).length} LOC)`);

    try {
      await saveInventoryToFirestore(map, file.name);
      setSyncStatus("DB 저장 완료");
    } catch (error) {
      console.error(error);
      setSyncStatus(error.message);
    }
  };

  const totalQty = Object.values(inventoryMap).reduce((sum, loc) => sum + getTotalQty(loc), 0);
  const occupiedCount = Object.values(inventoryMap).filter((loc) => getTotalQty(loc) > 0).length;

  return (
    <div className="app">
      <div className="panel">
        <h1>J ZONE 3D</h1>
        <p>1개 LOC에 여러 SKU 저장 가능</p>

        <label className="upload-btn">
          재고 엑셀 업로드
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />
        </label>

        {fileName && <div className="file-name">{fileName}</div>}
        <div className="file-name">{syncStatus}</div>

        <div className="info">
          <b>선택 렉</b>
          <span>{selectedRack}</span>

          <b>총 수량</b>
          <span>{totalQty}</span>

          <b>재고 LOC</b>
          <span>{occupiedCount}개</span>

          <b>저장 방식</b>
          <span>LOC별 다중 SKU</span>
        </div>

        <div className="loc-list">
          {selectedLocs.map(({ loc, data }) => (
            <button
              key={loc}
              className={getTotalQty(data) > 0 ? "loc-card has-stock" : "loc-card"}
              onClick={() => setPopupLoc({ loc, data })}
            >
              <strong>{loc}</strong>
              <span>{data?.items?.length ? `${data.items.length} SKU` : "빈 위치"}</span>
              <em>{getTotalQty(data)} EA</em>
            </button>
          ))}
        </div>
      </div>

      <Scene selectedRack={selectedRack} setSelectedRack={setSelectedRack} inventoryMap={inventoryMap} />

      {popupLoc && (
        <div className="popup-backdrop" onClick={() => setPopupLoc(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setPopupLoc(null)}>×</button>

            <h2>{popupLoc.loc}</h2>

            <div className="popup-info">
              <b>총 SKU</b>
              <span>{popupLoc.data?.items?.length || 0}개</span>

              <b>총 수량</b>
              <span>{getTotalQty(popupLoc.data)} EA</span>
            </div>

            <div className="sku-list">
              {popupLoc.data?.items?.length ? (
                popupLoc.data.items.map((item, index) => (
                  <div key={`${item.SKU}-${index}`} className="sku-row">
                    <strong>{item.SKU || "-"}</strong>
                    <span>{item.ITEM_NAME || "-"}</span>
                    <em>{item.QTY} EA</em>
                  </div>
                ))
              ) : (
                <div className="empty-sku">빈 위치</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}