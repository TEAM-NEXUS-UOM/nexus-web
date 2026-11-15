export interface ShipmentSchedule {
  id: string
  productName: string
  productCode: string
  destination: string
  quantity: number
  plannedDate: string
  reportReference: string | null
  status: 'Scheduled'
  approvalStatus: 'Approved' | 'Unverified'
}

export const shipmentSchedules: ShipmentSchedule[] = [
  { id: 'SCH-2048', productName: 'Cream Cracker 200g', productCode: 'MC-BIS-001', destination: 'Kandy Shop 014', quantity: 2400, plannedDate: '2026-10-20', reportReference: null, status: 'Scheduled', approvalStatus: 'Unverified' },
  { id: 'SCH-2049', productName: 'Chocolate Cream 150g', productCode: 'MC-BIS-002', destination: 'Gampaha Shop 006', quantity: 1200, plannedDate: '2026-10-21', reportReference: null, status: 'Scheduled', approvalStatus: 'Unverified' },
  { id: 'SCH-2050', productName: 'Lemon Puff 120g', productCode: 'MC-BIS-003', destination: 'Colombo Shop 021', quantity: 3000, plannedDate: '2026-10-22', reportReference: null, status: 'Scheduled', approvalStatus: 'Unverified' },
  { id: 'SCH-2051', productName: 'Nice 100g', productCode: 'MC-BIS-004', destination: 'Kurunegala Shop 003', quantity: 800, plannedDate: '2026-10-23', reportReference: null, status: 'Scheduled', approvalStatus: 'Unverified' },
  { id: 'SCH-2052', productName: 'Tikir Marie 150g', productCode: 'MC-BIS-006', destination: 'Negombo Shop 011', quantity: 1600, plannedDate: '2026-10-24', reportReference: null, status: 'Scheduled', approvalStatus: 'Unverified' },
]
