export type GoalContribution = {
  id: number
  amount: number
  date: string
}

export type NewGoalContribution = Omit<GoalContribution, 'id'>
