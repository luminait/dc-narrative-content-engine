'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/packages/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/packages/ui/shadcn/card';
import { Input } from '@/packages/ui/shadcn/input';
import { Label } from '@/packages/ui/shadcn/label';
import { createClient } from '@/src/server/supabase/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const supabase = createClient();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error signing in:', error.message);
            // Handle error appropriately
        } else {
            router.push('/campaigns');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignIn}>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">Sign In</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
