import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const segments = url.pathname.split('/');
        const id = segments[segments.length - 2];

        if (!id) {
            return NextResponse.json({ error: 'id가 없습니다' }, { status: 400 });
        }

        const studentUrl = `${url.origin}/checkin?event=${id}`;
        const qrDataUrl = await QRCode.toDataURL(studentUrl);

        return NextResponse.json({ qr: qrDataUrl }, { status: 200 });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message || 'QR 코드 생성 실패' }, { status: 500 });
    }
}
