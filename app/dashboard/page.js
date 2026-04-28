"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import "../app.css";
import { Onboarding, Dashboard } from "../oja";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth");
        return;
      }
      setSession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) {
        router.replace("/auth");
        return;
      }
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
      if (data) await supabase.from("activity_log").insert({ user_id: session.user.id, action: "login" });
    })();
  }, [session]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!session) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile || !profile.business_name || profile.business_name === "My Business") {
    return <Onboarding session={session} onComplete={setProfile} />;
  }
  return <Dashboard session={session} profile={profile} onProfile={setProfile} />;
}
