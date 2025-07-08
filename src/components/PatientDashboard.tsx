/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin, Phone, LogOut, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BookAppointmentModal from './BookAppointmentModal';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

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

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await appointmentAPI.cancel(appointmentId, 'Cancelled by patient');
      await loadAppointments();
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
                <h1 className="text-xl font-semibold">Welcome, {user?.name}</h1>
                <p className="text-sm text-muted-foreground">Patient Dashboard</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <Button 
            onClick={() => setShowBookingModal(true)}
            size="lg"
            className="shadow-medical"
          >
            <Plus className="h-5 w-5 mr-2" />
            Book New Appointment
          </Button>
        </div>

        {/* Appointments List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Appointments</h2>
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No appointments yet</h3>
                <p className="text-muted-foreground mb-4">
                  Book your first appointment to get started
                </p>
                <Button onClick={() => setShowBookingModal(true)}>
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment: any) => (
                <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">
                            Dr. {appointment.doctor?.user?.name}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <User className="h-4 w-4 mr-2" />
                            {appointment.doctor?.specialization}
                          </div>
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
                            {appointment.doctor?.user?.phone}
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
                              <strong>Doctor's Notes:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}

                        {appointment.prescription && (
                          <div className="mt-3 p-3 bg-medical-blue-light rounded-lg">
                            <p className="text-sm">
                              <strong>Prescription:</strong> {appointment.prescription}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-6">
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookAppointmentModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={loadAppointments}
        />
      )}
    </div>
  );
};

export default PatientDashboard;