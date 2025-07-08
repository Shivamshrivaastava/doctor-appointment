/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { doctorAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface DoctorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorInfo?: any;
}

const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onClose,
  doctorInfo,
}) => {
  const [formData, setFormData] = useState({
    specialization: doctorInfo?.specialization || '',
    qualification: doctorInfo?.qualification || '',
    experience: doctorInfo?.experience || '',
    licenseNumber: doctorInfo?.licenseNumber || '',
    consultationFee: doctorInfo?.consultationFee || '',
    bio: doctorInfo?.bio || '',
    hospital: {
      name: doctorInfo?.hospital?.name || '',
      address: {
        street: doctorInfo?.hospital?.address?.street || '',
        city: doctorInfo?.hospital?.address?.city || '',
        state: doctorInfo?.hospital?.address?.state || '',
        zipCode: doctorInfo?.hospital?.address?.zipCode || '',
      }
    },
    availability: doctorInfo?.availability || [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'saturday', startTime: '09:00', endTime: '17:00', isAvailable: false },
      { day: 'sunday', startTime: '09:00', endTime: '17:00', isAvailable: false },
    ],
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (doctorInfo) {
        await doctorAPI.updateProfile(formData);
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      } else {
        await doctorAPI.createProfile(formData);
        toast({
          title: "Success",
          description: "Profile created successfully!",
        });
      }
      onClose();
      window.location.reload(); // Refresh to load updated profile
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: string, value: any) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, availability: updatedAvailability }));
  };

  const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Neurology', 'Oncology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {doctorInfo ? 'Update Profile' : 'Complete Your Profile'}
          </DialogTitle>
          <DialogDescription>
            {doctorInfo ? 'Update your professional information' : 'Please complete your doctor profile to start receiving appointments'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select 
                value={formData.specialization} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                placeholder="e.g., MD, MBBS, PhD"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Years of experience"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="Medical license number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee ($)</Label>
              <Input
                id="consultationFee"
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData(prev => ({ ...prev, consultationFee: e.target.value }))}
                placeholder="Consultation fee"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief description about yourself and your practice"
              rows={3}
            />
          </div>

          {/* Hospital Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hospital/Clinic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital/Clinic Name</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospital.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hospital: { ...prev.hospital, name: e.target.value }
                  }))}
                  placeholder="Hospital or clinic name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.hospital.address.street}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hospital: {
                      ...prev.hospital,
                      address: { ...prev.hospital.address, street: e.target.value }
                    }
                  }))}
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.hospital.address.city}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hospital: {
                      ...prev.hospital,
                      address: { ...prev.hospital.address, city: e.target.value }
                    }
                  }))}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.hospital.address.state}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    hospital: {
                      ...prev.hospital,
                      address: { ...prev.hospital.address, state: e.target.value }
                    }
                  }))}
                  placeholder="State"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weekly Availability</h3>
            <div className="space-y-3">
              {formData.availability.map((daySchedule, index) => (
                <div key={daySchedule.day} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={daySchedule.isAvailable}
                      onCheckedChange={(checked) => 
                        handleAvailabilityChange(index, 'isAvailable', checked)
                      }
                    />
                    <Label className="w-20 capitalize">{daySchedule.day}</Label>
                  </div>
                  
                  {daySchedule.isAvailable && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Label>From:</Label>
                        <Input
                          type="time"
                          value={daySchedule.startTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, 'startTime', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>To:</Label>
                        <Input
                          type="time"
                          value={daySchedule.endTime}
                          onChange={(e) => 
                            handleAvailabilityChange(index, 'endTime', e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : doctorInfo ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileModal;