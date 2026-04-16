import app from "./app.ts";
import { initDb } from "./src/db/initDb.ts";
import { migrate } from "./src/db/migrate.ts";

const PORT = 3000;

async function start() {
  await initDb();
  await migrate();

  app.listen(PORT, () => {
    console.log(`Server running http://localhost:${PORT}`);
  });
}

start();