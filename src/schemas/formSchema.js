import { z } from "zod";

// Constraints for Validation
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_IMAGES = 5;

// Form Validation Schema
export const formSchema = z.object({
    username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),

    email: z
        .string()
        .trim()
        .email('Invalid email format'),
});