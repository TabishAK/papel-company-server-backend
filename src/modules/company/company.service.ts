import { HttpStatus, Injectable } from '@nestjs/common';
import { Http } from 'src/utils/http.util';
import { getTenantEndpoint } from 'src/utils/endpoint';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { getCompanySecretKeyHeader } from 'src/utils/company.util';

@Injectable()
export class CompanyService {
  async getCompanyTheme() {
    let response;
    try {
      const url = getTenantEndpoint() + '/tenant/company-theme/';
      response = await Http.get(url, { headers: { ...getCompanySecretKeyHeader() } });
    } catch (error) {
      return SerializeHttpResponse(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }

    return SerializeHttpResponse(
      response.data,
      HttpStatus.OK,
      'Company theme fetched successfully',
    );
  }
}
