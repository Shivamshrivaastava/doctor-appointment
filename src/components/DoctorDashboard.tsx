/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Phone, LogOut, Settings, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DoctorProfileModal from './DoctorProfileModal';
import CompleteAppointmentModal from './CompleteAppointmentModal';

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadAppointments();
    // Check if doctor needs to complete profile
    if (user && !user.doctorInfo) {
      setShowProfileModal(true);
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      const response = await appointmentAPI.getAll();
      setAppointments(response.appointments || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      await loadAppointments();
      toast({
        title: "Success",
        description: `Appointment ${status} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCompleteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'completed': return 'bg-primary text-white';
      case 'cancelled': return 'bg-destructive text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filterAppointments = (status?: string) => {
    if (!status) return appointments;
    return appointments.filter((apt: any) => apt.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Dr. {user?.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {user?.doctorInfo?.specialization || 'Doctor Dashboard'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowProfileModal(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filterAppointments('pending').length}
                </div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {filterAppointments('confirmed').length}
                </div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-medical-blue">
                  {filterAppointments('completed').length}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {appointments.length}
                </div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AppointmentsList 
              appointments={appointments}
              onStatusUpdate={handleStatusUpdate}
              onComplete={handleCompleteAppointment}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <AppointmentsList 
              appointments={filterAppointments('pending')}
              onStatusUpdate={handleStatusUpdate}
              onComplete={handleCompleteAppointment}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <AppointmentsList 
              appointments={filterAppointments('confirmed')}
              onStatusUpdate={handleStatusUpdate}
              onComplete={handleCompleteAppointment}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <AppointmentsList 
              appointments={filterAppointments('completed')}
              onStatusUpdate={handleStatusUpdate}
              onComplete={handleCompleteAppointment}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            <AppointmentsList 
              appointments={filterAppointments('cancelled')}
              onStatusUpdate={handleStatusUpdate}
              onComplete={handleCompleteAppointment}
              getStatusColor={getStatusColor}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showProfileModal && (
        <DoctorProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          doctorInfo={user?.doctorInfo}
        />
      )}

      {showCompleteModal && selectedAppointment && (
        <CompleteAppointmentModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={loadAppointments}
        />
      )}
    </div>
  );
};

const AppointmentsList: React.FC<{
  appointments: any[];
  onStatusUpdate: (id: string, status: string) => void;
  onComplete: (appointment: any) => void;
  getStatusColor: (status: string) => string;
}> = ({ appointments, onStatusUpdate, onComplete, getStatusColor }) => {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No appointments found</h3>
          <p className="text-muted-foreground">
            No appointments in this category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment: any) => (
        <Card key={appointment._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {appointment.patient?.name}
                  </h3>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {appointment.appointmentTime}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {appointment.patient?.phone}
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm">
                    <strong>Reason:</strong> {appointment.reason}
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Fee:</strong> ${appointment.fee}
                  </p>
                </div>

                {appointment.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col gap-2">
                {appointment.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(appointment)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DoctorDashboard;