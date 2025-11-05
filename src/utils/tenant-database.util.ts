// import { Injectable, Logger } from '@nestjs/common';
// import { DataSource } from 'typeorm';
// import { TenantDatabaseService } from './tenant-database.service';
// import { TenantDatabaseConfigService } from './tenant-database-config.service';

// @Injectable()
// export class TenantDatabaseUtilService {
//   private readonly logger = new Logger(TenantDatabaseUtilService.name);

//   constructor(
//     private readonly tenantDatabaseService: TenantDatabaseService,
//     private readonly tenantDatabaseConfigService: TenantDatabaseConfigService,
//   ) {}

/**
 * Get a repository for a specific entity in a tenant's database
 */
// async getTenantRepository<T>(tenantId: string, entity: new () => T) {
//   const connection = await this.tenantDatabaseService.getTenantConnection(tenantId);
//   return connection.getRepository(entity);
// }

// /**
//  * Execute a query in a tenant's database
//  */
// async executeTenantQuery(tenantId: string, query: string, parameters?: any[]) {
//   const connection = await this.tenantDatabaseService.getTenantConnection(tenantId);
//   return connection.query(query, parameters);
// }

// /**
//  * Get a tenant's database connection for custom operations
//  */
// async getTenantDataSource(tenantId: string): Promise<DataSource> {
//   return this.tenantDatabaseService.getTenantConnection(tenantId);
// }

// /**
//  * Check if a tenant database is available and connected
//  */
// async isTenantDatabaseAvailable(tenantId: string): Promise<boolean> {
//   try {
//     const isConnected = await this.tenantDatabaseConfigService.isTenantDatabaseConnected(tenantId);
//     return isConnected;
//   } catch (error) {
//     this.logger.error(`Error checking tenant database availability for ${tenantId}:`, error);
//     return false;
//   }
// }

// /**
//  * Ensure tenant database is connected, reconnect if necessary
//  */
// async ensureTenantDatabaseConnected(tenantId: string): Promise<boolean> {
//   try {
//     const isConnected = await this.tenantDatabaseConfigService.isTenantDatabaseConnected(tenantId);

//     if (!isConnected) {
//       this.logger.log(`Reconnecting tenant database for ${tenantId}`);
//       await this.tenantDatabaseConfigService.reconnectTenantDatabase(tenantId);
//       return true;
//     }

//     return true;
//   } catch (error) {
//     this.logger.error(`Failed to ensure tenant database connection for ${tenantId}:`, error);
//     return false;
//   }
// }

// /**
//  * Get all available tenant IDs with active database connections
//  */
// getAvailableTenantIds(): string[] {
//   return this.tenantDatabaseService.getActiveConnections();
// }

/**
 * Perform a health check on all tenant databases
 */
// async performHealthCheck(): Promise<{ [tenantId: string]: boolean }> {
//   const activeConnections = this.getAvailableTenantIds();
//   const healthStatus: { [tenantId: string]: boolean } = {};

//   for (const tenantId of activeConnections) {
//     try {
//       const isHealthy = await this.isTenantDatabaseAvailable(tenantId);
//       healthStatus[tenantId] = isHealthy;
//     } catch (error) {
//       this.logger.error(`Health check failed for tenant ${tenantId}:`, error);
//       healthStatus[tenantId] = false;
//     }
//   }

//   return healthStatus;
// }
// }
