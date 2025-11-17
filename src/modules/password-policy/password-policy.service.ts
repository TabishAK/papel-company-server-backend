import { Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http.util';
import { getTenantEndpoint } from 'src/utils/endpoint';
import { getCompanySecretKeyHeader } from 'src/utils/company.util';
import { PasswordPolicy } from 'src/types/password-policy.type';

@Injectable()
export class PasswordPolicyService {
  private policyCache: PasswordPolicy | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  async getPasswordPolicy(): Promise<PasswordPolicy | null> {
    if (this.policyCache && this.cacheExpiry && new Date() < this.cacheExpiry) {
      return this.policyCache;
    }

    try {
      const baseUrl = getTenantEndpoint();
      const endpoint = `${baseUrl}/password-policy/password-policy-company-server`;

      const response = await Http.get<PasswordPolicy>(endpoint, {
        headers: { ...getCompanySecretKeyHeader() },
      });

      if (response.data) {
        this.policyCache = response.data;
        this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION_MS);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error fetching password policy:', error);
      return null;
    }
  }

  clearCache(): void {
    this.policyCache = null;
    this.cacheExpiry = null;
  }
}
