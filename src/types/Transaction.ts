export type Transaction = {
  id: number
  description: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
}
