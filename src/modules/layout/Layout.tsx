import { auth } from "@/config/firebaseConfig";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutFirebaseUser } from "@/utils/firebaseAuthUtils";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ThemeSelector } from "../themeSelector";
import { NavBar, NavBarDropdown } from "./NavBar";
import { useBalanceStore } from "@/stores/useBalanceStore";

export type TPageLink = {
  label: string;
  href: string;
  alwaysShow?: true;
  horizontalClassName?: string;
};

const CloseDrawerWrapper: React.FC<{ children?: React.ReactNode }> = (p) => {
  return (
    <label htmlFor="sidebar" aria-label="close sidebar" className="drawer-overlay">
      {p.children}
    </label>
  );
};
const OpenDrawerWrapper: React.FC<{ children?: React.ReactNode }> = (p) => {
  return (
    <label htmlFor="sidebar" aria-label="open sidebar" className="btn btn-square btn-ghost">
      {p.children}
    </label>
  );
};

const NavBarContainer = (p: { children: React.ReactNode }) => {
  return (
    <div className="sticky top-0 z-[10]">
      <div className="navbar w-full border-b bg-base-300">{p.children}</div>
    </div>
  );
};
const DrawerContainer = (p: { children: React.ReactNode }) => {
  return <div className="m-0 min-h-full min-w-80 border-r bg-base-100 p-1">{p.children}</div>;
};

const ContainerWithSpotlightBackgroundTop = () => {
  return (
    <div className="absolute top-0 z-[-99] h-[90vh] min-w-full bg-gradient-to-tr from-base-100 via-base-100 via-75% to-primary sm:via-65%" />
  );
};

export const Layout = (p: { children: React.ReactNode }) => {
  const authStore = useAuthStore();
  const safeAuthStore = authStore.getSafeStore();
  const balanceStore = useBalanceStore();
  const safeBalanceStore = balanceStore.getSafeStore();

  return (
    <>
      <div className="drawer">
        <input id="sidebar" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <NavBarContainer>
            <NavBar
              leftChildren={
                <div className="flex items-center gap-2 pl-4">
                  <div className="block sm:hidden">
                    <OpenDrawerWrapper>
                      <Bars3Icon />
                    </OpenDrawerWrapper>
                  </div>
                  <Link href="/" className="p-0 text-3xl hover:underline">
                    EncryptDrop
                  </Link>
                </div>
              }
              rightChildren={
                <>
                  <div className="flex w-full items-center justify-end gap-6">
                    <div className="link no-underline">
                      {safeAuthStore.status === "logged_in" && (
                        <div>Coupons: {safeBalanceStore.balance?.numberOfCoupons ?? "0"}</div>
                      )}
                    </div>
                    <NavBarDropdown
                      labelChildren={(p: { tabIndex: 0 }) => (
                        <div className="link no-underline hover:underline" tabIndex={p.tabIndex}>
                          <div>Theme &#x25BC;</div>
                        </div>
                      )}
                    >
                      <div className="overflow-y-auto p-4">
                        <ThemeSelector />
                      </div>
                    </NavBarDropdown>
                    {safeAuthStore.status === "logged_in" && (
                      <Link
                        className="link no-underline hover:underline"
                        href="/"
                        onClick={() => {
                          balanceStore.clear();
                          logoutFirebaseUser({ auth });
                        }}
                      >
                        Log Out
                      </Link>
                    )}
                  </div>
                </>
              }
            />
          </NavBarContainer>
          {p.children}
          <ContainerWithSpotlightBackgroundTop />
        </div>
        <div className="drawer-side z-[11]">
          <CloseDrawerWrapper />

          <DrawerContainer>
            <CloseDrawerWrapper>asd </CloseDrawerWrapper>
          </DrawerContainer>
        </div>
      </div>
    </>
  );
};
