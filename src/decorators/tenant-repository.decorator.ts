import { SetMetadata } from '@nestjs/common';

export const TENANT_REPOSITORY_KEY = 'tenant_repository';

/**
 * Decorator to mark repositories that should use tenant database connection
 */
export const TenantRepository = () => SetMetadata(TENANT_REPOSITORY_KEY, true);
