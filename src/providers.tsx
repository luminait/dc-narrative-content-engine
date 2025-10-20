'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/src/server/supabase/client';
import { Session } from '@supabase/supabase-js';

const SessionContext = createContext<{ session: Session | null }>({ session: null });

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClient();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    return (
        <SessionContext.Provider value={{ session }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => useContext(SessionContext);
