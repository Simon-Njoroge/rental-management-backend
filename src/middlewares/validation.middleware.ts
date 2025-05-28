import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { Request, Response, NextFunction } from "express";

function validationMiddleware<T extends object>(
  type: new () => T,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const dtoObject = plainToInstance(type, req.body);
    validate(dtoObject, { whitelist: true, forbidNonWhitelisted: true }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const messages = errors
            .map((error) => Object.values(error.constraints || {}))
            .reduce((acc, val) => acc.concat(val), []);
          return res.status(400).json({
            success: false,
            errors: messages,
          });
        } else {
          req.body = dtoObject;
          next();
        }
      },
    );
  };
}

export default validationMiddleware;
