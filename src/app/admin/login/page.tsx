'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // 쿠키 전송
        });

        const data = await res.json();

        if (res.ok && data.success) {
            router.push('/');
            console.log('무냐');
        } else {
            alert('로그인 실패: ' + data.error);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded">
            <h1 className="text-xl font-bold mb-4">관리자 로그인</h1>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full mb-2"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 w-full mb-4"
            />
            <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">
                로그인
            </button>
        </div>
    );
}
