import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from './http';
import Http from './http';

type AccountProviderProps = {
  children: React.ReactNode;
};

type AccountProviderState = {
  account?: User;
  setAccount: (account?: User) => void;
};

const accountProviderInitialState: AccountProviderState = {
  account: undefined,
  setAccount: () => null,
};

const AccountProviderContext = createContext<AccountProviderState>(accountProviderInitialState);

export function AccountProvider({ children }: AccountProviderProps) {
  const [account, setAccount] = useState<User | undefined>(undefined);

  useEffect(() => {
    (async () => {
      try {
        const http = new Http();
        const user = await http.getCurrentUser();
        setAccount(user);
      } catch (_: unknown) {/* empty */}
    })();
  }, [setAccount]);

  const value: AccountProviderState = {
    account,
    setAccount,
  };

  return (
    <AccountProviderContext.Provider value={value}>{children}</AccountProviderContext.Provider>
  );
}

export function useAccount(): User | undefined {
  const { account } = useContext(AccountProviderContext);

  return account;
}
