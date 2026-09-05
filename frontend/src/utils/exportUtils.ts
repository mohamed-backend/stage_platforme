export interface ExportColumn<T> {
  header: string
  accessor: (item: T) => string | number | null | undefined
}

export function exportToCSV<T>(filename: string, columns: ExportColumn<T>[], data: T[]) {
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',')
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = col.accessor(item)
        if (val === null || val === undefined) return '""'
        const strVal = String(val).replace(/"/g, '""')
        return `"${strVal}"`
      })
      .join(',')
  )

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename.endsWith('.csv') ? filename : filename + '.csv'}`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToPDF<T>(title: string, columns: ExportColumn<T>[], data: T[]) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const headersHtml = columns
    .map(
      (col) =>
        `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f1f5f9; text-align: left; font-size: 11px; font-weight: bold; color: #1e293b;">${col.header}</th>`
    )
    .join('')

  const rowsHtml = data
    .map((item) => {
      const cells = columns
        .map((col) => {
          const val = col.accessor(item) ?? ''
          return `<td style="border: 1px solid #e2e8f0; padding: 8px 12px; font-size: 10px; color: #334155;">${val}</td>`
        })
        .join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: #0f172a; }
          p.meta { font-size: 11px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="meta">Rapport généré le ${new Date().toLocaleString('fr-FR')} · Plateforme Fundsy</p>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
