'use client';

import { useEffect, useState } from 'react';

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [name, setName] = useState('');

    async function load() {
        const res = await fetch('/api/admin/students/list');
        if (!res.ok) return;
        setStudents(await res.json());
    }

    async function addStudent() {
        if (!name.trim()) return;
        await fetch('/api/admin/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        setName('');
        load();
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">관리자: 학생 명단</h1>

            <div className="flex items-center gap-2 mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="학생 이름"
                    className="border p-2 rounded flex-1"
                />
                <button onClick={addStudent} className="px-4 py-2 bg-green-600 text-white rounded">
                    추가
                </button>
            </div>

            <ul className="list-disc pl-5">
                {students.map((s) => (
                    <li key={s.id}>{s.name}</li>
                ))}
            </ul>
        </main>
    );
}
