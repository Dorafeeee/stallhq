"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { CSS } from "../../lib/styles";
import { AuthScreen } from "../oja";

export default function AuthPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      } else {
        setChecked(true);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) router.replace("/dashboard");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!checked) return <><style>{CSS}</style><div className="loading-screen"><div className="spinner" /></div></>;
  return <><style>{CSS}</style><AuthScreen /></>;
}
