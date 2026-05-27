import React from "react";
import { levels } from "../data/layout";
import { getTotalQty } from "../utils/inventory";

export default function InventoryPanel({
  selectedRack,
  inventoryMap,
  fileName,
  syncStatus,
  onUpload,
  onOpenPopup,
}) {
  const selectedLocs = levels.map((level) => {
    const loc = `${selectedRack}-${level.no}`;

    return {
      loc,
      data: inventoryMap[loc] || null,
    };
  });

  const totalQty = Object.values(inventoryMap).reduce(
    (sum, loc) => sum + getTotalQty(loc),
    0
  );

  const occupiedCount = Object.values(inventoryMap).filter(
    (loc) => getTotalQty(loc) > 0
  ).length;

  return (
    <div className="panel">
      <h1>J ZONE 3D</h1>

      <p>현업형 3D 관제 / 선택 LOC만 표시</p>

      <label className="upload-btn">
        재고 엑셀 업로드
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onUpload}
        />
      </label>

      {fileName && (
        <div className="file-name">
          {fileName}
        </div>
      )}

      <div className="file-name">
        {syncStatus}
      </div>

      <div className="info">
        <b>선택 렉</b>
        <span>{selectedRack}</span>

        <b>총 수량</b>
        <span>{totalQty}</span>

        <b>재고 LOC</b>
        <span>{occupiedCount}개</span>

        <b>렌더 방식</b>
        <span>InstancedMesh</span>
      </div>

      <div className="loc-list">
        {selectedLocs.map(({ loc, data }) => (
          <button
            key={loc}
            className={
              getTotalQty(data) > 0
                ? "loc-card has-stock"
                : "loc-card"
            }
            onClick={() => onOpenPopup({ loc, data })}
          >
            <strong>{loc}</strong>

            <span>
              {data?.items?.length
                ? `${data.items.length} SKU`
                : "빈 위치"}
            </span>

            <em>{getTotalQty(data)} EA</em>
          </button>
        ))}
      </div>
    </div>
  );
}