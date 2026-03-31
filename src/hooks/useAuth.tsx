import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { UserProfile } from "@/types/map";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { profile: data ?? null, error };
  };
  const getRedirectUrl = () => {
    const envRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL;
    const base =
      envRedirectUrl && envRedirectUrl.trim().length > 0
        ? envRedirectUrl.trim()
        : window.location.origin;
    return base.endsWith("/") ? base : `${base}/`;
  };

  useEffect(() => {
    let isMounted = true;

    const setAuthState = (
      nextSession: Session | null,
      nextProfile: UserProfile | null,
    ) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setProfile(nextProfile);
      setLoading(false);
    };

    // РЎР»СѓС€Р°РµРј РёР·РјРµРЅРµРЅРёСЏ Р°РІС‚РѕСЂРёР·Р°С†РёРё
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;

      if (nextSession?.user) {
        const { profile, error } = await loadProfile(nextSession.user.id);
        if (error) {
          console.error("Failed to load profile", error);
          setAuthState(nextSession, null);
          return;
        }
        setAuthState(nextSession, profile);
        return;
      }

      setAuthState(nextSession, null);
    });

    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (error) {
        console.error("Failed to get session", error);
        setAuthState(null, null);
        return;
      }

      const nextSession = data.session;
      if (nextSession?.user) {
        const { profile, error: profileError } = await loadProfile(
          nextSession.user.id,
        );
        if (profileError) {
          console.error("Failed to load profile", profileError);
          setAuthState(nextSession, null);
          return;
        }
        setAuthState(nextSession, profile);
        return;
      }

      setAuthState(nextSession, null);
    };

    void initSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    const redirectUrl = getRedirectUrl();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username || email.split("@")[0],
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: getRedirectUrl(),
    });
    return { error: result.error || null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: "No user logged in" };

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

