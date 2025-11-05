export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface TenantRequest extends Request {
  tenant: {
    id: string;
    email: string;
    companyName: string;
  };
}
