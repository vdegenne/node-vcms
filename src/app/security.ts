import { Request, Response } from "express";


export function checkAuthorization(req: Request, res: Response, ...roles: string[]): boolean {
  if (roles.length == 0) {
    console.info('No roles specified for this route.');
    return false;
  }

  if (req.session && req.session.user && req.session.user.roles) {
    for (const role of roles) {
      if (req.session.user.roles.includes(role)) {
        return true;
      }
    }
  }

  return false;
}
