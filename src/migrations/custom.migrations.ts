import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class CustomMigrationService {
  private readonly logger = new Logger(CustomMigrationService.name);

  constructor(private dataSource: DataSource) {}

  async runMigrations() {
    // Ensure tracking table exists
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS custom_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    const applied: { name: string }[] = await this.dataSource.query(
      `SELECT name FROM custom_migrations`
    );
    const appliedNames = new Set(applied.map(r => r.name));

    const migrationsDir = join(__dirname, "../../../scripts/sql/");
    const files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql"));

    for (const file of files) {
      if (appliedNames.has(file)) {
        this.logger.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      this.logger.log(`Applying custom migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), "utf8");

      await this.dataSource.query(sql);

      await this.dataSource.query(
        `INSERT INTO custom_migrations(name) VALUES ($1)`,
        [file]
      );
    }

    this.logger.log("All custom migrations applied ✅");
  }
}
