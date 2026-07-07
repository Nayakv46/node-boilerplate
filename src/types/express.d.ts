declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userOrganizations?: string[];
    }
  }
}

export {};
