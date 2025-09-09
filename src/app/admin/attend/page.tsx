'use client';
import { useEffect, useState } from 'react';

interface Student {
    id: number;
    name: string;
    region: string;
}

interface Event {
    id: number;
    date: string;
}

interface Checkin {
    student_id: number;
    event_id: number;
    created_at: string;
    region?: string;
}

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [regionFilter, setRegionFilter] = useState<string>('전체');

    useEffect(() => {
        fetch('/api/admin/attendance', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                setStudents(data.students);
                setEvents(data.events);
                setCheckins(data.attendanceData);
            })
            .catch(console.error);
    }, []);

    // 날짜별 최신 체크인 찾기
    const latestCheckinMap: Record<string, Checkin> = {};
    checkins.forEach((c) => {
        const event = events.find((e) => e.id === c.event_id);
        if (!event) return;
        const key = `${c.student_id}-${event.date}`;
        if (!latestCheckinMap[key] || new Date(c.created_at) > new Date(latestCheckinMap[key].created_at)) {
            latestCheckinMap[key] = c;
        }
    });

    const isAttended = (studentId: number, eventDate: string) => {
        return !!latestCheckinMap[`${studentId}-${eventDate}`];
    };

    // 같은 날짜 여러 이벤트 중 최신 이벤트만 필터링
    const uniqueEventsByDate = Object.values(
        events.reduce((acc: Record<string, Event>, e) => {
            if (!acc[e.date] || e.id > acc[e.date].id) acc[e.date] = e;
            return acc;
        }, {})
    );

    // 지역 필터링 + 이름 오름차순 + 출석 여부 오름차순
    const filteredStudents = students
        .filter((s) => regionFilter === '전체' || s.region === regionFilter)
        .sort((a, b) => {
            // 먼저 출석 여부 기준
            const aAttended = uniqueEventsByDate.some((e) => isAttended(a.id, e.date));
            const bAttended = uniqueEventsByDate.some((e) => isAttended(b.id, e.date));
            if (aAttended !== bAttended) return aAttended ? -1 : 1; // 출석한 학생 먼저
            // 이름 기준 오름차순
            return a.name.localeCompare(b.name);
        });

    // 지역 목록 생성
    const regions = Array.from(new Set(students.map((s) => s.region)));

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">전체 출석 현황</h1>

            {/* 지역 필터 */}
            <div className="mb-4">
                <label className="mr-2 font-medium">지역 필터: </label>
                <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="전체">전체</option>
                    {regions.map((r) => (
                        <option
                            key={r}
                            value={r}
                        >
                            {r}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto border-collapse border border-gray-400 w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border">학생 (지역)</th>
                            {uniqueEventsByDate.map((e) => (
                                <th
                                    key={e.id}
                                    className="px-4 py-2 border"
                                >
                                    {e.date}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((s) => (
                            <tr key={s.id}>
                                <td className="px-4 py-2 border font-medium">
                                    {s.name} ({s.region})
                                </td>
                                {uniqueEventsByDate.map((e) => (
                                    <td
                                        key={`${s.id}-${e.id}`}
                                        className="px-4 py-2 border text-center"
                                    >
                                        {isAttended(s.id, e.date) ? '✅' : '❌'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
