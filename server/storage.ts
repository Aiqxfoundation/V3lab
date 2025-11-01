import { type DeployedToken, type InsertDeployedToken, deployedTokens, type User, type InsertUser, users } from "@shared/schema";
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
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAccessKey(accessKey: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async getUserByAccessKey(accessKey: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.hashedAccessKey, accessKey))
      .limit(1);
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
