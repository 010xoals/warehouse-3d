import * as XLSX from "xlsx";
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export const inventoryCol = collection(db, "jzone_inventory");
export const metaRef = doc(db, "jzone_meta", "latest");

export const getTotalQty = (data) =>
  Number(data?.TOTAL_QTY || 0);

export async function deleteOldInventory() {
  const snap = await getDocs(inventoryCol);
  const docs = snap.docs;

  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);

    docs.slice(i, i + 400).forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();
  }
}

export async function saveInventoryToFirestore(map, fileName) {
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

export async function loadInventoryFromFirestore() {
  const snap = await getDocs(inventoryCol);

  const map = {};

  snap.forEach((d) => {
    map[d.id] = d.data();
  });

  const metaSnap = await getDoc(metaRef);

  const meta = metaSnap.exists()
    ? metaSnap.data()
    : {};

  return { map, meta };
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