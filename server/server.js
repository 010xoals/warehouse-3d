const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const db = new sqlite3.Database("./warehouse.db");

// 테이블 생성
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loc TEXT,
      sku TEXT,
      itemName TEXT,
      qty INTEGER
    )
  `);
});

// 전체 조회
app.get("/inventory", (req, res) => {
  db.all(
    `SELECT * FROM inventory`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }

      res.json(rows);
    }
  );
});

// 전체 저장
app.post("/inventory", (req, res) => {
  const items = req.body;

  db.serialize(() => {
    db.run(`DELETE FROM inventory`);

    const stmt = db.prepare(`
      INSERT INTO inventory
      (loc, sku, itemName, qty)
      VALUES (?, ?, ?, ?)
    `);

    items.forEach((item) => {
      stmt.run(
        item.loc,
        item.sku,
        item.itemName,
        item.qty
      );
    });

    stmt.finalize();

    res.json({
      success: true,
      count: items.length,
    });
  });
});

// 전체 삭제
app.delete("/inventory", (req, res) => {
  db.run(`DELETE FROM inventory`, [], (err) => {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.json({
      success: true,
    });
  });
});

app.listen(PORT, () => {
  console.log(`
===================================
WAREHOUSE DB SERVER RUNNING
http://localhost:${PORT}
===================================
`);
});