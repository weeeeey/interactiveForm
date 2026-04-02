export const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
