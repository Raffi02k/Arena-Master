import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("tournaments.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/tournaments", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM tournaments ORDER BY created_at DESC");
      const rows = stmt.all() as any[];
      res.json(rows.map(row => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        data: JSON.parse(row.data)
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.post("/api/tournaments", (req, res) => {
    const { id, name, data } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO tournaments (id, name, data, created_at) VALUES (?, ?, ?, ?)");
      stmt.run(id, name, JSON.stringify(data), Date.now());
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });

  app.get("/api/tournaments/:id", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM tournaments WHERE id = ?");
      const row = stmt.get(req.params.id) as any;
      if (row) {
        res.json(JSON.parse(row.data));
      } else {
        res.status(404).json({ error: "Tournament not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  app.patch("/api/tournaments/:id", (req, res) => {
    const { data } = req.body;
    try {
      const stmt = db.prepare("UPDATE tournaments SET data = ? WHERE id = ?");
      const info = stmt.run(JSON.stringify(data), req.params.id);
      if (info.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Tournament not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update tournament" });
    }
  });

  app.delete("/api/tournaments/:id", (req, res) => {
    try {
      const stmt = db.prepare("DELETE FROM tournaments WHERE id = ?");
      const info = stmt.run(req.params.id);
      if (info.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Tournament not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete tournament" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
