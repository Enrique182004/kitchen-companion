import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./auth.store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, loading: true });
  });

  it("starts with null user and loading true", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.session).toBeNull();
    expect(state.loading).toBe(true);
  });

  it("setUser updates user", () => {
    const fakeUser = { id: "abc", email: "test@example.com" } as never;
    useAuthStore.getState().setUser(fakeUser);
    expect(useAuthStore.getState().user).toEqual(fakeUser);
  });

  it("setSession updates session and derives user", () => {
    const fakeUser = { id: "abc", email: "test@example.com" };
    const fakeSession = { user: fakeUser, access_token: "tok" } as never;
    useAuthStore.getState().setSession(fakeSession);
    expect(useAuthStore.getState().session).toEqual(fakeSession);
    expect(useAuthStore.getState().user).toEqual(fakeUser);
  });

  it("setLoading updates loading", () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
