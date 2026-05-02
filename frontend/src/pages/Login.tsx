import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { client } from '../auth/client';
import { LogIn } from 'lucide-react';

type LoginMode = 'login' | 'signup';

interface LoginProps {
    mode?: LoginMode;
    onBack?: () => void;
}

export default function Login({ mode = 'login', onBack }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(mode === 'signup');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsRegistering(mode === 'signup');
        setError('');
    }, [mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegistering) {
                // Register user
                await client.post('/api/register', {
                    email: email,
                    password: password
                });

                // If registration succeeds, log in
            }

            // Login logic
            const form = new URLSearchParams();
            form.append('username', email);
            form.append('password', password);

            const response = await client.post('/api/token', form, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            await login(response.data.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || (isRegistering ? 'Registration failed.' : 'Login failed. Please check your credentials.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent px-4 py-12">
            <div className="max-w-md w-full p-8 bg-zinc-900/70 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-500/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-green-500/10 blur-3xl rounded-full" />
                {onBack && (
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                )}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
                        <LogIn size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Arena-Master</h2>
                    <p className="text-zinc-400 mt-2">
                        {isRegistering ? 'Create an account to get started' : 'Sign in to manage your tournaments'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">
                        {typeof error === 'string' ? error : JSON.stringify(error)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-zinc-950/80 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:border-transparent transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-zinc-950/80 border border-zinc-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:border-transparent transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl flex items-center justify-center transition-all shadow-[0_0_24px_rgba(34,197,94,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (isRegistering ? 'Creating account...' : 'Signing in...') : (isRegistering ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-8 text-center text-zinc-400">
                    <p>
                        {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                            }}
                            className="text-green-500 hover:text-green-400 font-bold transition-colors"
                        >
                            {isRegistering ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
