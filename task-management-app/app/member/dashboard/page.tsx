import MemberDashboard from "@/components/member/dashboard"
import ProtectedRoute from "@/components/protected-route"

export default function MemberDashboardPage() {
  return (
    <ProtectedRoute allowedRole="member">
      <MemberDashboard />
    </ProtectedRoute>
  )
}

