'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Student {
    id: number;
    name: string;
    region: string;
}

interface PendingByRegion {
    [region: string]: Student[];
}

export default function AdminPage() {
    const [date, setDate] = useState('');
    const [eventId, setEventId] = useState<string | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [pending, setPending] = useState<PendingByRegion>({});

    // 쿠키 기반 인증 확인
    const checkAuth = async (): Promise<boolean> => {
        try {
            const res = await fetch('/api/admin/checkAuth', {
                credentials: 'include',
            });
            if (!res.ok) return false;
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        (async () => {
            const authenticated = await checkAuth();
            if (!authenticated) {
                window.location.href = '/admin/login';
            }
        })();
    }, []);

    const fetchPending = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/events/${id}/pending`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('미출석 명단 불러오기 실패');

            const students: Student[] = await res.json();
            const grouped: PendingByRegion = {};
            students.forEach((s) => {
                if (!grouped[s.region]) grouped[s.region] = [];
                grouped[s.region].push(s);
            });
            setPending(grouped);
        } catch (err: any) {
            console.error(err.message);
        }
    };

    const createEvent = async () => {
        if (!date) return alert('날짜를 입력해주세요');

        try {
            const res = await fetch(`/api/admin/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date }),
                credentials: 'include',
            });

            if (!res.ok) throw new Error('이벤트 생성 실패');

            const data = await res.json();
            setEventId(data.id);

            const studentUrl = `${window.location.origin}/checkin?event=${data.id}`;
            const qrDataUrl = await QRCode.toDataURL(studentUrl);
            setQrUrl(qrDataUrl);

            fetchPending(data.id);
        } catch (err: any) {
            alert(err.message);
        }
    };

    useEffect(() => {
        if (!eventId) return;
        const interval = setInterval(() => fetchPending(eventId), 5000);
        return () => clearInterval(interval);
    }, [eventId]);

    return (
        <div className="flex flex-col items-center justify-start w-screen h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-4">출석 이벤트 관리</h1>

            <div className="flex items-center gap-4 mb-4">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-3 rounded text-2xl"
                />
                <button
                    onClick={createEvent}
                    className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 text-2xl"
                >
                    이벤트 생성
                </button>
            </div>

            <div className="flex flex-1 w-full h-full gap-8">
                <div className="flex-1 flex flex-col items-center justify-center">
                    {eventId && qrUrl && (
                        <>
                            <h2 className="text-3xl font-semibold mb-2">QR 코드</h2>
                            <img
                                src={qrUrl}
                                alt="출석 QR 코드"
                                className="w-full max-w-3xl h-full max-h-[80vh] border-4 border-gray-800 p-4 rounded-lg shadow-lg"
                            />
                            <p className="text-xl text-gray-500 mt-4">학생들은 QR 코드를 스캔하세요</p>
                        </>
                    )}
                </div>

                <div className="flex-1 h-full overflow-hidden flex flex-col">
                    <h2 className="text-3xl font-semibold mb-4 text-center">미출석 학생 명단</h2>
                    <div className="flex-1 grid grid-cols-2 gap-2 overflow-hidden">
                        {Object.keys(pending).length === 0 && (
                            <p className="text-xl text-gray-500 col-span-2 text-center">모든 학생이 출석했습니다</p>
                        )}
                        {Object.entries(pending).map(([region, students]) => (
                            <div key={region} className="col-span-1 flex flex-col border rounded p-2 overflow-hidden">
                                <h3 className="font-bold text-xl text-blue-700 mb-2">{region}</h3>
                                <ul className="flex-1 overflow-hidden">
                                    {students.map((s) => (
                                        <li key={s.id} className="text-sm py-1 border-b last:border-b-0">
                                            {s.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
