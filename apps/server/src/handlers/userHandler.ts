import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { pool } from '../config/db';

// ======================
// Reusable Zod Schemas (Zod v4 — correct syntax)
// ======================
const idParamSchema = z.object({
  id: z.coerce
    .number({
      error: (iss) =>
        iss.input === undefined || iss.input === ''
          ? 'User ID is required'
          : 'User ID must be a valid number',
    })
    .int({ error: 'User ID must be an integer' })
    .positive({ error: 'User ID must be a positive number' })
    .max(2147483647, { error: 'User ID is too large' }),
});

const createUserSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, { error: 'Name is required' }),

  email: z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email({ error: 'Invalid email format' }),
});

const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { error: 'Name must not be empty' })
      .optional(),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ error: 'Invalid email format' })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (name or email) must be provided for update',
  });

// ======================
// Validation Middleware (unchanged — works perfectly)
// ======================
const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        ...req.params,
        ...req.body,
      });

      // Put validated + transformed values back
      req.params = { ...req.params, ...result };
      req.body = { ...req.body, ...result };

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: err.issues.map((e) => ({
            field: e.path.join('.') || 'body',
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
};

export { idParamSchema, createUserSchema, updateUserSchema, validate };


// ======================
// Controllers
// ======================

// GET /api/v1/users
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/users/:id
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id); // already validated & coerced by Zod

    const result = await pool.query(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at, updated_at',
      [name, email]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }
    next(error);
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
      });
    }
    next(error);
  }
};

// DELETE /api/v1/users/:id
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${id} deleted successfully`,
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};