import { parseCSV, parseCSVLine } from '../csv/parser'

describe('CSV Parser', () => {
  it('parses basic CSV with headers and rows', () => {
    const csv = 'date,amount,description\n2025-01-01,12.34,Test Transaction\n2025-01-02,45.67,Another'
    const result = parseCSV(csv, { previewLimit: 10 })
    expect(result.headers).toEqual(['date','amount','description'])
    expect(result.totalRows).toBe(2)
    expect(result.rows[0]).toEqual(['2025-01-01','12.34','Test Transaction'])
  })

  it('handles quoted fields with commas', () => {
    const csv = 'description,amount\n"Coffee, Large",4.50\n"Lunch, Salad",12.00'
    const result = parseCSV(csv)
    expect(result.rows[0][0]).toBe('Coffee, Large')
    expect(result.rows[1][0]).toBe('Lunch, Salad')
  })

  it('throws on empty file', () => {
    expect(() => parseCSV('\n\n')).toThrow('CSV file is empty')
  })

  it('parseCSVLine parses escaped quotes', () => {
    const line = '"He said ""Hello""",100'
    expect(parseCSVLine(line)).toEqual(['He said "Hello"','100'])
  })
})
