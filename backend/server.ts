import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { Pool, type QueryResult } from "pg";
import { z } from "zod";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

const commentSchema = z.object({
  name: z.string().min(1, "name is required"),
  comment: z.string().min(1, "comment is required"),
});

function validateBody(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: `Validation failed: make sure that name and comment field are present`,
        issues: result.error.issues.map((i) => ({
          path: i.path.join(""),
          message: i.message,
        })),
      });
      console.error(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
});
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, From Backend!");
});

app.get("/api/comment", async (_req: Request, res: Response) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let comments;
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS comments 
         (ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT, comment TEXT)
        `,
    );

    const result = await pool.query("SELECT * FROM comments");
    comments = result.rows;
    console.log("SELECTED: \n", result.rows);
  } catch (e) {
    res.status(500).json({ ok: false, error: `internal server error: ${e}` });
    console.error(e);
  } finally {
    pool.end();
  }

  res.json({ ok: true, data: comments });
});

app.post(
  "/api/comment",
  validateBody(commentSchema),
  async (req: Request, res: Response) => {
    const body = req.body;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS comments 
         (ID INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name TEXT, comment TEXT)
        `,
      );

      const inserted: QueryResult = await pool.query(
        `INSERT INTO comments (name, comment) VALUES ($1, $2) RETURNING *`,
        [body.name, body.comment],
      );
      console.log("INSERTED: \n", inserted.rows[0]);
    } catch (e) {
      console.log("error while quering\n", e);
      res.status(500).json({
        ok: false,
        error: `something went wrong while quering the database: ${e}`,
      });
    } finally {
      pool.end();
    }

    console.log("GOT BODY:", body);

    res.json({ ok: true, name: body.name, comment: body.comment });
  },
);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

export default app;

// Only listen when run directly (`bun run server.ts`); on Vercel the app is
// imported by the serverless function, which supplies its own listener.
if (import.meta.main) {
  app.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
  });
}
