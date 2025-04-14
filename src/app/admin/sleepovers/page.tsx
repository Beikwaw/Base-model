'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { getAllSleepoverRequests, updateSleepoverStatus } from '@/lib/firestore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RequestActions } from '@/components/admin/RequestActions';
import { RefreshButton } from '@/components/ui/refresh-button';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    return format(date.toDate(), 'PPP');
  }
  return format(new Date(date), 'PPP');
};

export default function SleepoverRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const fetchedRequests = await getAllSleepoverRequests();
      setRequests(fetchedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      await updateSleepoverStatus(id, status as any, adminResponse);
      await fetchRequests();
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const RequestCard = ({ request }: { request: any }) => (
    <Card key={request.id}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">Sleepover Request</h3>
              <Badge variant={
                request.status === 'approved' ? 'default' :
                request.status === 'pending' ? 'secondary' :
                'destructive'
              }>
                {request.status}
              </Badge>
            </div>
            
            <div className="bg-amber-50 p-2 rounded-md border border-amber-200 mb-2">
              <p className="text-sm font-semibold text-amber-800">
                Tenant Code: {request.tenantCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Guest:</span> {request.guestName}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Phone:</span> {request.guestPhone}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Room:</span> {request.roomNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">From:</span> {formatDate(request.startDate)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">To:</span> {formatDate(request.endDate)}
                </p>
              </div>
            </div>
          </div>
          <RequestActions
            type="sleepover"
            data={request}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sleepover Requests</CardTitle>
          <RefreshButton onClick={fetchRequests} loading={loading} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {requests
                .filter((request) => request.status === 'pending')
                .map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {requests
                .filter((request) => request.status === 'approved')
                .map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {requests
                .filter((request) => request.status === 'rejected')
                .map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 