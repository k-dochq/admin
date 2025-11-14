/**
 * HTML 엔티티를 디코딩하는 함수
 * Google Translate API가 HTML 형식으로 반환하는 경우 엔티티를 디코딩
 */
export function decodeHtmlEntities(text: string): string {
  // 숫자 엔티티 디코딩 (&#39; → ')
  let decoded = text.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  // 16진수 엔티티 디코딩 (&#x27; → ')
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // 일반적인 HTML 엔티티 디코딩
  const entityMap: Record<string, string> = {
    '&quot;': '"',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&apos;': "'",
  };

  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }

  return decoded;
}
