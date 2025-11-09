/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { appointmentAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
  actionType?: 'confirm' | 'complete'; // ✅ NEW PROP
}

const CompleteAppointmentModal: React.FC<CompleteAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  actionType = 'complete', // default
}) => {
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (actionType === 'confirm') {
        // ✅ Confirm appointment with notes and prescription
        await appointmentAPI.updateStatus(appointment._id, 'confirmed');
        await appointmentAPI.complete(appointment._id, {
          notes,
          prescription,
          diagnosis,
        });

        toast({
          title: 'Confirmed',
          description: 'Appointment confirmed successfully!',
        });
      } else {
        // ✅ Complete appointment
        await appointmentAPI.complete(appointment._id, {
          notes,
          prescription,
          diagnosis,
        });

        toast({
          title: 'Completed',
          description: 'Appointment completed successfully!',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === 'confirm' ? 'Confirm Appointment' : 'Complete Appointment'}
          </DialogTitle>
          <DialogDescription>
            {actionType === 'confirm'
              ? `Add notes, diagnosis, and prescription before confirming for ${appointment?.patient?.name}`
              : `Add notes, diagnosis, and prescription for ${appointment?.patient?.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Textarea
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add consultation notes"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription</Label>
            <Textarea
              id="prescription"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              placeholder="Enter prescription details"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? actionType === 'confirm'
                  ? 'Confirming...'
                  : 'Completing...'
                : actionType === 'confirm'
                ? 'Confirm Appointment'
                : 'Complete Appointment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteAppointmentModal;
