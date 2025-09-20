import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'

// Get the current user session
export async function getSession() {
  const supabase = createClient()
  return supabase.auth.getSession()
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email,
    password,
  })
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}

// Get current user
export async function getCurrentUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error) {
    return null
  }
  
  return data.user
}