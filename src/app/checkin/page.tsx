'use client';
import { useState, useEffect } from 'react';

export default function CheckInPage() {
    const [eventId, setEventId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');

    // 클라이언트에서만 실행
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('event');
        setEventId(id);
    }, []);

    async function submit() {
        if (!eventId) {
            setStatus('❌ QR 코드가 잘못되었습니다.');
            return;
        }
        if (!name) {
            setStatus('❌ 이름을 입력해주세요.');
            return;
        }

        try {
            const res = await fetch('/api/checkins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, name }),
            });

            const data = await res.json();
            if (res.ok) setStatus('✅ 출석 완료!');
            else setStatus(`❌ 출석 실패: ${data.error || '이름 확인 필요'}`);
        } catch (err: any) {
            setStatus(`❌ 출석 실패: ${err.message}`);
        }
    }

    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-4xl font-bold mb-8">출석 체크</h1>
            <input
                type="text"
                placeholder="이름 입력"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-4 rounded w-96 text-2xl text-center mb-6"
            />
            <button
                onClick={submit}
                className="px-8 py-4 bg-blue-600 text-white text-2xl font-semibold rounded hover:bg-blue-700"
            >
                제 출
            </button>
            <div className="mt-6 text-3xl font-bold text-center text-green-700">{status}</div>
        </main>
    );
}
