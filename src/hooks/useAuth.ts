import { useState, useEffect } from "react";
import { externalSupabase } from "@/integrations/supabase/externalClient";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  name: string;
  avatarUrl: string;
  email: string;
  phone: string;
}

function buildProfile(u: User): UserProfile {
  const phone = u.phone || "";
  const email = u.email || "";
  // Имя: из Google metadata, или из email, или красивый номер телефона
  let name = u.user_metadata?.full_name || u.user_metadata?.name || "";
  if (!name && email) name = email.split("@")[0];
  if (!name && phone) {
    // Форматируем +77001234567 → +7 700 123-45-67
    const d = phone.replace(/\D/g, "");
    if (d.length === 11) {
      name = `+7 ${d.slice(1,4)} ${d.slice(4,7)}-${d.slice(7,9)}-${d.slice(9,11)}`;
    } else {
      name = phone;
    }
  }
  if (!name) name = "Пользователь";

  return {
    name,
    avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || "",
    email,
    phone,
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Подписка на изменения сессии
    const { data: { subscription } } = externalSupabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setProfile(u ? buildProfile(u) : null);
      setLoading(false);
    });

    // Текущая сессия при монтировании
    externalSupabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setProfile(u ? buildProfile(u) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await externalSupabase.auth.signOut();
  };

  return { user, profile, loading, signOut };
}
