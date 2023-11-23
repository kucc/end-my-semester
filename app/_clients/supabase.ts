import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database

if (
	!process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
	!process.env.NEXT_PUBLIC_SUPABASE_PROJECT_API_KEY
) {
	throw new Error("Missing environment variables for Supabase.");
}

export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
	process.env.NEXT_PUBLIC_SUPABASE_PROJECT_API_KEY
);
