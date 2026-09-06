import { useState } from 'react';
import { useAuth } from '@/ctx/auth-context';

export function useLoginForm() {
  const { login, rememberMe, setRememberMe } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (onSuccess?: () => void) => {
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('Please enter your username or email');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password }, rememberMe);
      onSuccess?.();
    } catch (err: any) {
      console.error('Login failure:', err);
      setErrorMsg(err?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    errorMsg,
    setErrorMsg,
    rememberMe,
    setRememberMe,
    handleLogin,
  };
}
