// middleware/schemas.js - Zod schemas for every mutating endpoint.
const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'must be a valid id');
const nonEmpty = (label, max) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`);

// --- auth ---------------------------------------------------------------
// role is deliberately absent: self-registration always creates a student.
exports.registerSchema = z.object({
  name: nonEmpty('name', 100),
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(6, 'password must be at least 6 characters').max(128),
  roomNumber: z.string().trim().max(20).optional(),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, 'must be a valid phone number')
});

exports.loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('must be a valid email'),
  password: z.string().min(1, 'password is required')
});

// --- complaints ---------------------------------------------------------
exports.createComplaintSchema = z.object({
  title: nonEmpty('title', 200),
  description: nonEmpty('description', 5000),
  category: z.enum(['maintenance', 'cleanliness', 'security', 'food', 'other']),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

exports.updateComplaintSchema = z
  .object({
    status: z.enum(['pending', 'in-progress', 'resolved', 'rejected']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    adminNotes: z.string().trim().max(5000).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'provide at least one field to update'
  });

exports.commentSchema = z.object({
  comment: nonEmpty('comment', 2000)
});

// --- rentals ------------------------------------------------------------
const rentalCategory = z.enum([
  'books',
  'electronics',
  'furniture',
  'sports',
  'clothing',
  'other'
]);
const rentalCondition = z.enum(['new', 'like-new', 'good', 'fair', 'poor']);

exports.createRentalSchema = z.object({
  title: nonEmpty('title', 200),
  description: nonEmpty('description', 5000),
  category: rentalCategory,
  pricePerDay: z.coerce.number().nonnegative('pricePerDay cannot be negative'),
  images: z.array(z.string()).max(10).optional(),
  condition: rentalCondition.optional()
});

exports.updateRentalSchema = z
  .object({
    title: nonEmpty('title', 200).optional(),
    description: nonEmpty('description', 5000).optional(),
    category: rentalCategory.optional(),
    pricePerDay: z.coerce.number().nonnegative().optional(),
    images: z.array(z.string()).max(10).optional(),
    condition: rentalCondition.optional(),
    available: z.boolean().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'provide at least one field to update'
  });

// --- groups -------------------------------------------------------------
const groupCategory = z.enum([
  'study',
  'sports',
  'events',
  'entertainment',
  'food',
  'general'
]);

const groupSettings = z
  .object({
    onlyAdminsCanPost: z.boolean().optional(),
    requireApproval: z.boolean().optional(),
    hiddenFromHostelAdmin: z.boolean().optional(),
    allowMembersToInvite: z.boolean().optional()
  })
  .optional();

exports.createGroupSchema = z.object({
  name: nonEmpty('name', 100),
  description: nonEmpty('description', 2000),
  category: groupCategory.optional(),
  privacy: z.enum(['public', 'private']).optional(),
  image: z.string().optional(),
  settings: groupSettings
});

exports.updateGroupSchema = z
  .object({
    name: nonEmpty('name', 100).optional(),
    description: nonEmpty('description', 2000).optional(),
    category: groupCategory.optional(),
    privacy: z.enum(['public', 'private']).optional(),
    image: z.string().optional(),
    settings: groupSettings
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'provide at least one field to update'
  });

exports.groupMessageSchema = z.object({
  message: nonEmpty('message', 2000)
});

exports.objectId = objectId;
