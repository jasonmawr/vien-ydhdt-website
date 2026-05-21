import * as oracledb from "oracledb";

declare module "oracledb" {
  interface Connection {
    execute<T = any>(
      sql: string,
      bindParams?: any,
      options?: any
    ): Promise<Result<T>>;
  }
}
