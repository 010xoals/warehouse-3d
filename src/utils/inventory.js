import * as XLSX from "xlsx";

const API = "https://entrepreneur-servers-rogers-principal.trycloudflare.com";

export const getTotalQty = (data) =>
  Number(data?.TOTAL_QTY || 0);

export async function saveInventoryToFirestore(
  map,
  fileName
) {
  const rows = [];

  Object.entries(map).forEach(([loc, data]) => {
    data.items.forEach((item) => {
      rows.push({
        loc,
        sku: item.SKU,
        itemName: item.ITEM_NAME,
        qty: item.QTY,
      });
    });
  });

  const res = await fetch(`${API}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rows),
  });

  return await res.json();
}

export async function loadInventoryFromFirestore() {
  const res = await fetch(`${API}/inventory`);

  const rows = await res.json();

  const map = {};

  rows.forEach((row) => {
    if (!map[row.loc]) {
      map[row.loc] = {
        LOC: row.loc,
        items: [],
        TOTAL_QTY: 0,
      };
    }

    map[row.loc].items.push({
      SKU: row.sku,
      ITEM_NAME: row.itemName,
      QTY: row.qty,
    });

    map[row.loc].TOTAL_QTY += row.qty;
  });

  return {
    map,
    meta: {
      fileName: "LOCAL_DB",
    },
  };
}

export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheet =
    workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet);

  const map = {};

  rows.forEach((row) => {
    const loc = String(
      row.LOC ||
        row.loc ||
        row.Location ||
        row.location ||
        ""
    ).trim();

    if (!loc) return;

    const sku = String(
      row.SKU ||
        row.sku ||
        row.SKU_CD ||
        row.sku_cd ||
        row.상품코드 ||
        row.품번 ||
        ""
    ).trim();

    const itemName = String(
      row.ITEM_NAME ||
        row.item_name ||
        row.품목명 ||
        row.상품명 ||
        ""
    ).trim();

    const qty = Number(
      row.QTY ??
        row.qty ??
        row.수량 ??
        0
    );

    if (!map[loc]) {
      map[loc] = {
        LOC: loc,
        items: [],
        TOTAL_QTY: 0,
      };
    }

    const existing = map[loc].items.find(
      (item) =>
        item.SKU === sku
    );

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

  return map;
}