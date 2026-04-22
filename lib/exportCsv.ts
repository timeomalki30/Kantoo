/**
 * Génère et télécharge un fichier CSV compatible Excel FR :
 *  - Séparateur : point-virgule
 *  - Encodage   : UTF-8 avec BOM (pour Excel)
 *  - Retours à la ligne : CRLF
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
): void {
  const BOM = '\uFEFF'

  const esc = (v: string | number | null | undefined) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  const csv =
    BOM +
    [headers, ...rows]
      .map((row) => row.map(esc).join(';'))
      .join('\r\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
