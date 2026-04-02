'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Organization, OrgMember, OrgRole } from '@/types';

interface OrgContextValue {
  org: Organization | null;
  membership: OrgMember | null;
  role: OrgRole | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  switchOrg: (orgId: string) => void;
}

const OrgContext = createContext<OrgContextValue>({
  org: null,
  membership: null,
  role: null,
  loading: true,
  error: null,
  refresh: async () => {},
  switchOrg: () => {},
});

export function useOrg() {
  return useContext(OrgContext);
}

const ORG_STORAGE_KEY = 'imp-pro-current-org';

interface OrgProviderProps {
  children: ReactNode;
  userId: string;
}

export function OrgProvider({ children, userId }: OrgProviderProps) {
  const supabase = createClient();
  const [org, setOrg] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrgMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrg = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all memberships for this user (accepted ones)
      const { data: memberships, error: memErr } = await supabase
        .from('org_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .not('accepted_at', 'is', null)
        .order('accepted_at', { ascending: false });

      if (memErr) throw memErr;

      if (!memberships || memberships.length === 0) {
        // User has no org - they need to create one
        setOrg(null);
        setMembership(null);
        setLoading(false);
        return;
      }

      // Check if there's a stored preference
      let preferredOrgId: string | null = null;
      try {
        preferredOrgId = localStorage.getItem(ORG_STORAGE_KEY);
      } catch {
        // SSR or localStorage not available
      }

      // Find preferred org or default to first
      const target =
        memberships.find((m) => m.org_id === preferredOrgId) || memberships[0];

      const orgData = target.organizations as unknown as Organization;
      setOrg(orgData);
      setMembership({
        id: target.id,
        org_id: target.org_id,
        user_id: target.user_id,
        role: target.role as OrgRole,
        invited_at: target.invited_at,
        accepted_at: target.accepted_at,
      });

      try {
        localStorage.setItem(ORG_STORAGE_KEY, target.org_id);
      } catch {
        // Ignore
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  const switchOrg = useCallback(
    (orgId: string) => {
      try {
        localStorage.setItem(ORG_STORAGE_KEY, orgId);
      } catch {
        // Ignore
      }
      loadOrg();
    },
    [loadOrg]
  );

  return (
    <OrgContext.Provider
      value={{
        org,
        membership,
        role: membership?.role ?? null,
        loading,
        error,
        refresh: loadOrg,
        switchOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}
