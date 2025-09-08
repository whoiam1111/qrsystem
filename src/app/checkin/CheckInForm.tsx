// src/app/checkin/CheckInForm.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CheckInForm() {
    const params = useSearchParams();
    const eventId = params.get('event') || '';
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [submitted, setSubmitted] = useState(false);

    async function submit() {
        if (!eventId) return setStatus('❌ QR 코드가 잘못되었습니다.');
        if (!name) return setStatus('❌ 이름을 입력해주세요.');

        try {
            const res = await fetch('/api/checkins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, name }),
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('✅ 출석 완료!');
                setSubmitted(true);
            } else {
                setStatus(`❌ 출석 실패: ${data.error || '이름 확인 필요'}`);
            }
        } catch (err: any) {
            setStatus(`❌ 출석 실패: ${err.message}`);
        }
    }

    // LED용 단일 화면: 이름 입력 완료 후 상태 3초 후 초기화
    useEffect(() => {
        if (submitted) {
            const timeout = setTimeout(() => {
                setName('');
                setStatus('');
                setSubmitted(false);
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [submitted]);

    return (
        <main className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">출석 체크</h1>

            <input
                type="text"
                placeholder="이름 입력"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-4 border-blue-600 p-4 rounded w-96 text-2xl text-center mb-6 focus:outline-none focus:ring-4 focus:ring-blue-400"
                disabled={submitted}
            />

            <button
                onClick={submit}
                className="px-8 py-4 bg-blue-600 text-white text-2xl font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={submitted}
            >
                제출
            </button>

            <div className="mt-6 text-3xl font-bold text-center text-green-700">{status}</div>
        </main>
    );
}
