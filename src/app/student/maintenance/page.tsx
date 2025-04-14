"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Wrench, Trash, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createMaintenanceRequest, getMyMaintenanceRequests } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from 'next/navigation'

interface MaintenanceRequest {
  id: string
  category: string
  roomNumber: string
  description: string
  date: string
  timeSlot: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "completed"
  createdAt: Date
}

export default function MaintenanceRequestPage() {
  const { user, userData } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    roomNumber: userData?.room_number || '',
    tenantCode: userData?.tenant_code || '',
    priority: 'medium'
  })

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to submit a request")
      return
    }
    
    setLoading(true)

    try {
      await createMaintenanceRequest({
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        roomNumber: formData.roomNumber,
        tenantCode: formData.tenantCode,
        priority: formData.priority,
        status: 'pending',
        createdAt: new Date()
      })
      toast.success("Maintenance request submitted successfully")
      router.push('/student/maintenance')
    } catch (error) {
      console.error("Error submitting request:", error)
      toast.error("Failed to submit maintenance request")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter(request => request.id !== id))
    toast.success("Maintenance request deleted successfully")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const fetchRequests = async () => {
    if (!user) return
    try {
      setLoading(true)
      const userRequests = await getMyMaintenanceRequests(user.uid)
      setRequests(userRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to fetch maintenance requests")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Maintenance Requests</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Submit Request</CardTitle>
                <CardDescription>Fill in the details of your maintenance request.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form id="maintenanceForm" onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-black">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomNumber" className="text-black">Room Number</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  readOnly
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantCode" className="text-black">Tenant Code</Label>
                <Input
                  id="tenantCode"
                  name="tenantCode"
                  value={formData.tenantCode}
                  readOnly
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-black">Priority Level</Label>
                <RadioGroup name="priority" required className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="text-black">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-black">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="text-black">High</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="rounded-md bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Service Availability Notice</h4>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Service delivery is dependent on staff availability. Weekend requests are subject to change.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>View and manage your maintenance requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-6">
                <Wrench className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No maintenance requests submitted</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-start justify-between border-b pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-black">{request.category}</p>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Room: {request.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">Date: {request.date}</p>
                      <p className="text-sm text-muted-foreground">Time: {request.timeSlot}</p>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 