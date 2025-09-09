export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold">에니어 교육 출석 관리 시스템</h1>
            <p className="mt-2 text-gray-600">관리자는 QR을 생성하고, 학생은 QR로 출석합니다.</p>
            <div className="mt-6 space-x-4">
                <a href="/admin" className="px-4 py-2 bg-blue-600 text-white rounded">
                    관리자 페이지
                </a>
                {/* <a href="/checkin" className="px-4 py-2 bg-green-600 text-white rounded">
                    출석 페이지
                </a> */}
            </div>
        </main>
    );
}
