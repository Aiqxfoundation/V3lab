import { type DeployedToken, type InsertDeployedToken, deployedTokens } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, desc } from "drizzle-orm";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

export interface IStorage {
  createDeployedToken(token: InsertDeployedToken): Promise<DeployedToken>;
  getDeployedTokens(): Promise<DeployedToken[]>;
  getDeployedTokenById(id: string): Promise<DeployedToken | undefined>;
  updateDeployedToken(id: string, updates: Partial<DeployedToken>): Promise<DeployedToken | undefined>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  async createDeployedToken(insertToken: InsertDeployedToken): Promise<DeployedToken> {
    const [token] = await this.db
      .insert(deployedTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async getDeployedTokens(): Promise<DeployedToken[]> {
    const tokens = await this.db
      .select()
      .from(deployedTokens)
      .orderBy(desc(deployedTokens.createdAt));
    return tokens;
  }

  async getDeployedTokenById(id: string): Promise<DeployedToken | undefined> {
    const [token] = await this.db
      .select()
      .from(deployedTokens)
      .where(eq(deployedTokens.id, id))
      .limit(1);
    return token;
  }

  async updateDeployedToken(
    id: string,
    updates: Partial<DeployedToken>
  ): Promise<DeployedToken | undefined> {
    const [updated] = await this.db
      .update(deployedTokens)
      .set(updates)
      .where(eq(deployedTokens.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
