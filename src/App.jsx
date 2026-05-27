import React, { useEffect, useState } from "react";
import "./index.css";

import WarehouseScene from "./components/WarehouseScene";
import InventoryPanel from "./components/InventoryPanel";

import {
  getTotalQty,
  loadInventoryFromFirestore,
  parseExcel,
  saveInventoryToFirestore,
} from "./utils/inventory";

export default function App() {
  const [selectedRack, setSelectedRack] = useState("J13-01");
  const [inventoryMap, setInventoryMap] = useState({});
  const [fileName, setFileName] = useState("");
  const [syncStatus, setSyncStatus] = useState("DB 불러오는 중...");
  const [popupLoc, setPopupLoc] = useState(null);

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

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileName(file.name);
      setSyncStatus("엑셀 읽는 중...");

      const map = await parseExcel(file);

      setInventoryMap(map);
      setSyncStatus(`DB 저장 중... (${Object.keys(map).length} LOC)`);

      await saveInventoryToFirestore(map, file.name);

      setSyncStatus("DB 저장 완료");
    } catch (error) {
      console.error(error);
      setSyncStatus(error.message);
    }
  };

  return (
    <div className="app">
      <InventoryPanel
        selectedRack={selectedRack}
        inventoryMap={inventoryMap}
        fileName={fileName}
        syncStatus={syncStatus}
        onUpload={handleUpload}
        onOpenPopup={setPopupLoc}
      />

      <WarehouseScene
        selectedRack={selectedRack}
        setSelectedRack={setSelectedRack}
        inventoryMap={inventoryMap}
      />

      {popupLoc && (
        <div
          className="popup-backdrop"
          onClick={() => setPopupLoc(null)}
        >
          <div
            className="popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="popup-close"
              onClick={() => setPopupLoc(null)}
            >
              ×
            </button>

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
                  <div
                    key={`${item.SKU}-${index}`}
                    className="sku-row"
                  >
                    <strong>{item.SKU || "-"}</strong>
                    <span>{item.ITEM_NAME || "-"}</span>
                    <em>{item.QTY} EA</em>
                  </div>
                ))
              ) : (
                <div className="empty-sku">
                  빈 위치
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}